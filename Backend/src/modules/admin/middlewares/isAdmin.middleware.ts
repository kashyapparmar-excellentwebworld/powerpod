import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/middlewares/errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'

export function isAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.platform !== 'admin') {
    throw new AppError('Admin access required', StatusCode.FORBIDDEN)
  }
  next()
}
