import prisma from '@/core/prisma'
import { randomToken, sha256, hashPassword, comparePassword } from '@/utils/crypto'
import { env } from '@/config/env.config'
import { logger } from '@/utils/logger'
import { AppError } from '@/middlewares/errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'
import { emailQueue } from '@/jobs/email/email.queue'
import { renderTemplate } from '@/utils/email'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt'
import {
  createSession,
  rotateSession,
  revokeSession,
  revokeAllEntitySessions,
} from '@/utils/session'
import { EntityType, Prisma } from '@prisma/client'
import { Translator } from '@/types/translator.types'
import type { JwtPayload } from './auth.types'
import type { LoginResponseDto, RefreshTokenResponseDto, AdminProfileDto } from './auth.dto'
import type { SessionContext } from '@/utils/session'
import type {
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  VerifyResetTokenInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from './auth.validator'
import { getPermissionsAndMenusForRole } from '../rbac/rbac.helper'
import { recordAuditLog } from '../auditLog/auditLog.service'

function buildJwtPayload(id: string, roleId: string, roleName: string): JwtPayload {
  return {
    id,
    roleId,
    roleName,
    isSuperAdmin: roleName === 'super_admin',
    platform: 'admin',
  }
}

export async function loginService(
  input: LoginInput,
  context: SessionContext,
  tr: Translator,
): Promise<LoginResponseDto> {
  const admin = await prisma.admin.findFirst({
    where: { email: input.email, isActive: true, deletedAt: null },
    include: { role: true },
  })

  if (!admin || !admin.role.isActive) {
    logger.warn({ email: input.email }, 'Failed login attempt')
    throw new AppError(tr.t('admin.auth.invalid_credentials'), StatusCode.UNAUTHORIZED)
  }

  const passwordValid = await comparePassword(input.password, admin.passwordHash)
  if (!passwordValid) {
    logger.warn({ email: input.email }, 'Failed login attempt — wrong password')
    throw new AppError(tr.t('admin.auth.invalid_credentials'), StatusCode.UNAUTHORIZED)
  }

  const isSuperAdmin = admin.role.name === 'super_admin'
  const payload = buildJwtPayload(admin.id, admin.roleId, admin.role.name)
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  const { permissions, menus } = await getPermissionsAndMenusForRole(admin.roleId, isSuperAdmin)

  await Promise.all([
    createSession(EntityType.admin, admin.id, refreshToken, context),
    prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }),
  ])

  logger.info({ adminId: admin.id, role: admin.role.name }, 'Admin logged in')

  recordAuditLog({
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.fullName,
    action: 'LOGIN',
    module: 'AUTH',
    description: `User '${admin.fullName}' (${admin.email}) signed in`,
    ipAddress: context.ipAddress,
    userAgent: (context as any).userAgent,
  })

  const userPayload = {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    avatarUrl: admin.avatarUrl,
    roleId: admin.roleId,
    role: {
      id: admin.role.id,
      name: admin.role.label || admin.role.name,
      label: admin.role.label || admin.role.name,
    },
  }

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_EXPIRES_IN,
    user: userPayload,
    admin: userPayload as any,
    role: {
      id: admin.role.id,
      name: admin.role.label || admin.role.name,
    },
    permissions,
    menus,
  }
}

export async function refreshTokenService(
  input: RefreshTokenInput,
  deviceInfo: Prisma.InputJsonObject | null,
  ipAddress: string | null,
  tr: Translator,
): Promise<RefreshTokenResponseDto> {
  let decoded: JwtPayload
  try {
    decoded = verifyRefreshToken(input.refreshToken)
  } catch {
    throw new AppError(tr.t('admin.auth.refresh_invalid'), StatusCode.UNAUTHORIZED)
  }

  const payload = buildJwtPayload(decoded.id, decoded.roleId, decoded.roleName)
  const accessToken = generateAccessToken(payload)
  const newRefreshToken = generateRefreshToken(payload)

  const rotated = await rotateSession(input.refreshToken, newRefreshToken, deviceInfo, ipAddress)
  if (!rotated) {
    throw new AppError(tr.t('admin.auth.refresh_invalid'), StatusCode.UNAUTHORIZED)
  }

  return { accessToken, refreshToken: newRefreshToken, expiresIn: env.JWT_EXPIRES_IN }
}

export async function logoutService(adminId: string, rawRefreshToken: string): Promise<void> {
  await revokeSession(rawRefreshToken, EntityType.admin, adminId)
  logger.info({ adminId }, 'Admin logged out')
}

export async function forgotPasswordService(
  input: ForgotPasswordInput,
  tr: Translator,
): Promise<void> {
  const admin = await prisma.admin.findFirst({
    where: { email: input.email, deletedAt: null },
  })

  if (!admin) {
    logger.info({ email: input.email }, 'Forgot password — email not found, silently ignored')
    return
  }

  const resetToken = randomToken()
  const hashedToken = sha256(resetToken)
  const expiry = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordResetToken: hashedToken, passwordResetExpiry: expiry },
  })

  const resetUrl = `${env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`

  const html = await renderTemplate('emails/admin/forgot-password.ejs', {
    name: admin.fullName,
    resetUrl,
  })

  await emailQueue.add('forgot-password', {
    to: admin.email,
    subject: tr.t('admin.auth.forgot_password_email_subject'),
    html,
  })

  logger.info({ adminId: admin.id }, 'Password reset email queued')
}

export async function verifyResetTokenService(
  input: VerifyResetTokenInput,
  tr: Translator,
): Promise<void> {
  const hashedToken = sha256(input.token)

  const admin = await prisma.admin.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: { gt: new Date() },
      deletedAt: null,
    },
  })

  if (!admin) throw new AppError(tr.t('admin.auth.reset_token_invalid'), StatusCode.BAD_REQUEST)
}

export async function resetPasswordService(
  input: ResetPasswordInput,
  tr: Translator,
): Promise<void> {
  const hashedToken = sha256(input.token)

  const admin = await prisma.admin.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiry: { gt: new Date() },
      deletedAt: null,
    },
  })

  if (!admin) {
    throw new AppError(tr.t('admin.auth.reset_token_invalid'), StatusCode.BAD_REQUEST)
  }

  const passwordHash = await hashPassword(input.newPassword)

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  })

  // Revoke all active sessions — forces re-login on every device
  await revokeAllEntitySessions(EntityType.admin, admin.id)

  const html = await renderTemplate('emails/admin/reset-password-success.ejs', {
    name: admin.fullName,
    adminPortalUrl: `${env.FRONTEND_URL}/admin/login`,
  })

  await emailQueue.add('reset-password-success', {
    to: admin.email,
    subject: tr.t('admin.auth.reset_password_email_subject'),
    html,
  })

  logger.info({ adminId: admin.id }, 'Password reset successfully')
}

export async function getProfileService(adminId: string, tr: Translator): Promise<AdminProfileDto> {
  const admin = await prisma.admin.findFirst({
    where: { id: adminId, deletedAt: null },
    include: { role: true },
  })

  if (!admin) throw new AppError(tr.t('admin.auth.profile_not_found'), StatusCode.NOT_FOUND)

  const isSuperAdmin = admin.role.name === 'super_admin'
  const { permissions, menus } = await getPermissionsAndMenusForRole(admin.roleId, isSuperAdmin)

  const userPayload = {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    avatarUrl: admin.avatarUrl,
    roleId: admin.roleId,
    role: {
      id: admin.role.id,
      name: admin.role.label || admin.role.name,
      label: admin.role.label || admin.role.name,
    },
  }

  return {
    user: userPayload,
    admin: userPayload as any,
    role: {
      id: admin.role.id,
      name: admin.role.label || admin.role.name,
    },
    permissions,
    menus,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
  }
}

export async function updateProfileService(
  adminId: string,
  input: UpdateProfileInput,
  tr: Translator,
): Promise<AdminProfileDto> {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    },
  })

  return getProfileService(adminId, tr)
}

export async function changePasswordService(
  adminId: string,
  input: ChangePasswordInput,
  tr: Translator,
): Promise<void> {
  const admin = await prisma.admin.findFirst({
    where: { id: adminId, deletedAt: null },
  })

  if (!admin) throw new AppError(tr.t('admin.auth.profile_not_found'), StatusCode.NOT_FOUND)

  const valid = await comparePassword(input.currentPassword, admin.passwordHash)
  if (!valid)
    throw new AppError(tr.t('admin.auth.change_password_wrong_current'), StatusCode.BAD_REQUEST)

  const passwordHash = await hashPassword(input.newPassword)

  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } })

  // Revoke all active sessions — forces re-login on every device
  await revokeAllEntitySessions(EntityType.admin, adminId)
  logger.info({ adminId }, 'Password changed — all sessions revoked')
}
