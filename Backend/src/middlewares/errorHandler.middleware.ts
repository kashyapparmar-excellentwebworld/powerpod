import { Request, Response, NextFunction } from 'express'
import { StatusCode } from '@/constants/statusCodes'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = StatusCode.INTERNAL_SERVER_ERROR,
    public isOperational: boolean = true,
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }
  console.error(err)
  res
    .status(StatusCode.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: 'Internal server error' })
}
