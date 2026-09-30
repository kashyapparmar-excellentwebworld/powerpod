import { Request, Response } from 'express'
import { ClientType } from '@prisma/client'
import { sendSuccess } from '@/utils/response'
import { parseDeviceInfo } from '@/utils/session'
import {
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  verifyResetTokenService,
  resetPasswordService,
  getProfileService,
  updateProfileService,
  changePasswordService,
} from './auth.service'
import type {
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
  ForgotPasswordInput,
  VerifyResetTokenInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from './auth.validator'

export async function login(req: Request, res: Response): Promise<void> {
  const data = await loginService(
    req.body as LoginInput,
    {
      clientType: ClientType.admin,
      deviceInfo: parseDeviceInfo(req.headers['user-agent']),
      ipAddress: req.ip ?? null,
    },
    req.translator,
  )
  sendSuccess(res, data, req.translator.t('admin.auth.login_success'))
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const data = await refreshTokenService(
    req.body as RefreshTokenInput,
    parseDeviceInfo(req.headers['user-agent']),
    req.ip ?? null,
    req.translator,
  )
  sendSuccess(res, data, req.translator.t('admin.auth.refresh_success'))
}

export async function logout(req: Request, res: Response): Promise<void> {
  await logoutService(req.user!.id, (req.body as LogoutInput).refreshToken)
  sendSuccess(res, null, req.translator.t('admin.auth.logout_success'))
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await forgotPasswordService(req.body as ForgotPasswordInput, req.translator)
  sendSuccess(res, null, req.translator.t('admin.auth.forgot_password_success'))
}

export async function verifyResetToken(req: Request, res: Response): Promise<void> {
  await verifyResetTokenService(req.body as VerifyResetTokenInput, req.translator)
  sendSuccess(res, null, req.translator.t('admin.auth.reset_token_valid'))
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await resetPasswordService(req.body as ResetPasswordInput, req.translator)
  sendSuccess(res, null, req.translator.t('admin.auth.reset_password_success'))
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const data = await getProfileService(req.user!.id, req.translator)
  sendSuccess(res, data, req.translator.t('admin.auth.profile_fetched'))
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const data = await updateProfileService(
    req.user!.id,
    req.body as UpdateProfileInput,
    req.translator,
  )
  sendSuccess(res, data, req.translator.t('admin.auth.profile_updated'))
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  await changePasswordService(req.user!.id, req.body as ChangePasswordInput, req.translator)
  sendSuccess(res, null, req.translator.t('admin.auth.change_password_success'))
}
