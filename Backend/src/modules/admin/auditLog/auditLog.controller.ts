import { Request, Response, NextFunction } from 'express'
import * as auditService from './auditLog.service'
import { StatusCode } from '@/constants/statusCodes'

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await auditService.listAuditLogsService(req.query as any)
    res.status(StatusCode.OK).json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

export async function getAuditLogAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admins = await auditService.getAuditLogAdminsService()
    res.status(StatusCode.OK).json({ success: true, data: admins })
  } catch (error) {
    next(error)
  }
}
