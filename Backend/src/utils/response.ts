import { Response } from 'express'
import { StatusCode } from '@/constants/statusCodes'

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, unknown>
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = StatusCode.OK,
  meta?: Record<string, unknown>,
): void {
  const payload: ApiResponse<T> = { success: true, message, data }
  if (meta) payload.meta = meta
  res.status(statusCode).json(payload)
}

export function sendError(
  res: Response,
  message = 'Something went wrong',
  statusCode = StatusCode.INTERNAL_SERVER_ERROR,
): void {
  res.status(statusCode).json({ success: false, message })
}
