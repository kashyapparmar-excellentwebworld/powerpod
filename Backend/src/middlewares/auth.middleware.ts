import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler.middleware'
import { verifyAccessToken } from '@/utils/jwt'
import { StatusCode } from '@/constants/statusCodes'

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) throw new AppError(req.translator.t('admin.auth.no_token'), StatusCode.UNAUTHORIZED)

  try {
    req.user = verifyAccessToken(token) as Express.User
    next()
  } catch {
    throw new AppError(req.translator.t('admin.auth.token_invalid'), StatusCode.UNAUTHORIZED)
  }
}
