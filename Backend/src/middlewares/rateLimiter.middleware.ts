import { Request, Response, NextFunction } from 'express'
import { sendError } from '@/utils/response'
import { logger } from '@/utils/logger'
import { StatusCode } from '@/constants/statusCodes'
import { redis } from '@/core/redis'

interface RateLimitInfo {
  count: number
  resetTime: number
}

const RATE_LIMIT_RULES: Record<string, { limit: number; window: number }> = {
  '/api/v1/admin/auth/login': { limit: 5, window: 60 },
  '/api/v1/admin/auth/forgot-password': { limit: 3, window: 120 },
  '/api/v1/admin/auth/reset-password': { limit: 5, window: 120 },
  '/api/v1/admin/auth/refresh-token': { limit: 10, window: 60 },
  '*': { limit: 100, window: 60 },
}

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const path = req.path
  const rule = RATE_LIMIT_RULES[path] || RATE_LIMIT_RULES['*']
  const identifier = (req as any).user?.id || req.ip || 'unknown'
  const key = `rate_limit:${path}:${identifier}`

  try {
    const now = Date.now()
    const stored = await redis.get(key)
    let info: RateLimitInfo = stored ? JSON.parse(stored) : null

    if (!info || now > info.resetTime) {
      info = {
        count: 1,
        resetTime: now + rule.window * 1000,
      }
    } else {
      info.count++
    }

    const ttl = Math.ceil((info.resetTime - now) / 1000)
    await redis.set(key, JSON.stringify(info), 'EX', ttl)

    if (info.count > rule.limit) {
      return sendError(
        res,
        'Too many requests. Please try again later.',
        StatusCode.TOO_MANY_REQUESTS,
      )
    }
  } catch (error) {
    logger.error({ err: error }, 'Rate limiting error')
  }

  next()
}
