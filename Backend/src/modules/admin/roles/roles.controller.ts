import { Request, Response } from 'express'
import { sendSuccess } from '@/utils/response'
import { getRolesDropdownService } from './roles.service'

export async function getRolesDropdown(req: Request, res: Response): Promise<void> {
  const data = await getRolesDropdownService()
  sendSuccess(res, data, req.translator.t('admin.roles.list_success'))
}
