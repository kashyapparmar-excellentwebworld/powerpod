import { Request, Response } from 'express'
import { sendSuccess } from '@/utils/response'
import { StatusCode } from '@/constants/statusCodes'
import {
  listAdminsService,
  getAdminService,
  createAdminService,
  updateAdminService,
  toggleAdminStatusService,
  deleteAdminService,
} from './admins.service'
import type { ListAdminsQuery } from './admins.types'
import type { CreateAdminInput, UpdateAdminInput } from './admins.validator'

export async function listAdmins(req: Request, res: Response): Promise<void> {
  const { page, limit, search, roleId, isActive } = req.query as Record<string, string>
  const parsedLimit =
    limit !== undefined ? Math.min(100, Math.max(1, parseInt(limit) || 1)) : undefined
  const query: ListAdminsQuery = {
    page: page !== undefined ? Math.max(1, parseInt(page) || 1) : undefined,
    limit: parsedLimit,
    search: search?.trim() || undefined,
    roleId: roleId || undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  }
  const data = await listAdminsService(query, req.translator)
  sendSuccess(res, data, req.translator.t('admin.admins.list_success'))
}

export async function getAdmin(req: Request, res: Response): Promise<void> {
  const data = await getAdminService(String(req.params.id), req.translator)
  sendSuccess(res, data, req.translator.t('admin.admins.get_success'))
}

export async function createAdmin(req: Request, res: Response): Promise<void> {
  const data = await createAdminService(req.body as CreateAdminInput, req.translator)
  sendSuccess(res, data, req.translator.t('admin.admins.create_success'), StatusCode.CREATED)
}

export async function updateAdmin(req: Request, res: Response): Promise<void> {
  const data = await updateAdminService(
    String(req.params.id),
    req.body as UpdateAdminInput,
    req.user!.id,
    req.translator,
  )
  sendSuccess(res, data, req.translator.t('admin.admins.update_success'))
}

export async function toggleAdminStatus(req: Request, res: Response): Promise<void> {
  const data = await toggleAdminStatusService(String(req.params.id), req.user!.id, req.translator)
  sendSuccess(res, data, req.translator.t('admin.admins.toggle_status_success'))
}

export async function deleteAdmin(req: Request, res: Response): Promise<void> {
  await deleteAdminService(String(req.params.id), req.user!.id, req.translator)
  sendSuccess(res, null, req.translator.t('admin.admins.delete_success'))
}
