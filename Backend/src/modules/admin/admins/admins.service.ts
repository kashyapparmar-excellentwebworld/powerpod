import prisma from '@/core/prisma'
import { hashPassword } from '@/utils/crypto'
import { paginate } from '@/utils/pagination'
import { logger } from '@/utils/logger'
import { AppError } from '@/middlewares/errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'
import { Translator } from '@/types/translator.types'
import type { AdminDto, AdminListDto, AdminStatusDto } from './admins.dto'
import type { AdminWithRole, ListAdminsQuery } from './admins.types'
import type { CreateAdminInput, UpdateAdminInput } from './admins.validator'

function pickAdmin(admin: AdminWithRole): AdminDto {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    avatarUrl: admin.avatarUrl,
    role: { id: admin.role.id, name: admin.role.name, label: admin.role.label },
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }
}

export async function listAdminsService(
  query: ListAdminsQuery,
  tr: Translator,
): Promise<AdminListDto> {
  const { page, limit, search, roleId, isActive } = query

  const where = {
    deletedAt: null,
    ...(isActive !== undefined && { isActive }),
    ...(roleId && { roleId }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [admins, total] = await prisma.$transaction([
    prisma.admin.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
      ...(limit != null && { skip: ((page ?? 1) - 1) * limit, take: limit }),
    }),
    prisma.admin.count({ where }),
  ])

  return paginate(admins.map(pickAdmin), total, page, limit, 'admins')
}

export async function getAdminService(id: string, tr: Translator): Promise<AdminDto> {
  const admin = await prisma.admin.findFirst({
    where: { id, deletedAt: null },
    include: { role: true },
  })
  if (!admin) throw new AppError(tr.t('admin.admins.not_found'), StatusCode.NOT_FOUND)
  return pickAdmin(admin)
}

export async function createAdminService(
  input: CreateAdminInput,
  tr: Translator,
): Promise<AdminDto> {
  const existing = await prisma.admin.findFirst({
    where: { email: input.email, deletedAt: null },
  })
  if (existing) throw new AppError(tr.t('admin.admins.email_taken'), StatusCode.CONFLICT)

  const role = await prisma.adminRole.findFirst({
    where: { id: input.roleId, isActive: true, deletedAt: null },
  })
  if (!role) throw new AppError(tr.t('admin.admins.role_not_found'), StatusCode.NOT_FOUND)

  const passwordHash = await hashPassword(input.password)

  const admin = await prisma.admin.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      roleId: input.roleId,
      avatarUrl: input.avatarUrl ?? null,
    },
    include: { role: true },
  })

  logger.info({ adminId: admin.id }, 'Admin account created')
  return pickAdmin(admin)
}

export async function updateAdminService(
  id: string,
  input: UpdateAdminInput,
  requesterId: string,
  tr: Translator,
): Promise<AdminDto> {
  const admin = await prisma.admin.findFirst({
    where: { id, deletedAt: null },
    include: { role: true },
  })
  if (!admin) throw new AppError(tr.t('admin.admins.not_found'), StatusCode.NOT_FOUND)

  if (input.email && input.email !== admin.email) {
    const taken = await prisma.admin.findFirst({
      where: { email: input.email, deletedAt: null },
    })
    if (taken) throw new AppError(tr.t('admin.admins.email_taken'), StatusCode.CONFLICT)
  }

  if (input.roleId) {
    const role = await prisma.adminRole.findFirst({
      where: { id: input.roleId, isActive: true, deletedAt: null },
    })
    if (!role) throw new AppError(tr.t('admin.admins.role_not_found'), StatusCode.NOT_FOUND)
  }

  const updated = await prisma.admin.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.roleId !== undefined && { roleId: input.roleId }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    },
    include: { role: true },
  })

  logger.info({ adminId: id, requesterId }, 'Admin account updated')
  return pickAdmin(updated)
}

export async function toggleAdminStatusService(
  id: string,
  requesterId: string,
  tr: Translator,
): Promise<AdminStatusDto> {
  if (id === requesterId) {
    throw new AppError(tr.t('admin.admins.cannot_deactivate_self'), StatusCode.BAD_REQUEST)
  }

  const admin = await prisma.admin.findFirst({
    where: { id, deletedAt: null },
  })
  if (!admin) throw new AppError(tr.t('admin.admins.not_found'), StatusCode.NOT_FOUND)

  const updated = await prisma.admin.update({
    where: { id },
    data: { isActive: !admin.isActive },
  })

  logger.info({ adminId: id, requesterId, isActive: updated.isActive }, 'Admin status toggled')
  return { id: updated.id, isActive: updated.isActive }
}

export async function deleteAdminService(
  id: string,
  requesterId: string,
  tr: Translator,
): Promise<void> {
  if (id === requesterId) {
    throw new AppError(tr.t('admin.admins.cannot_delete_self'), StatusCode.BAD_REQUEST)
  }

  const admin = await prisma.admin.findFirst({
    where: { id, deletedAt: null },
  })
  if (!admin) throw new AppError(tr.t('admin.admins.not_found'), StatusCode.NOT_FOUND)

  await prisma.admin.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })

  logger.info({ adminId: id, requesterId }, 'Admin account deleted')
}
