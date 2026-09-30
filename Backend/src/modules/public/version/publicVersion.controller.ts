import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { checkAppVersionService } from './publicVersion.service'

const versionCheckBodySchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  version: z.string().min(1, 'Version is required'),
  language: z.string().optional().default('en'),
  deviceId: z.string().optional(),
  userId: z.string().optional(),
})

export async function checkAppVersion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = versionCheckBodySchema.parse(req.body)
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress

    const result = await checkAppVersionService({
      ...body,
      ip,
    })

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
