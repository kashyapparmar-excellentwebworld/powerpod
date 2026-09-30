import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/middlewares/errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'

export function isSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new AppError('Super admin access required', StatusCode.FORBIDDEN)
  }
  next()
}
