import { Request, Response } from 'express'
import { prisma } from '@/core/prisma'

export async function submitAiFeedbackController(req: Request, res: Response) {
  try {
    const { query, aiAnswer, rating, comment } = req.body
    const adminId = (req as any).user?.id

    if (!query || !aiAnswer || rating === undefined) {
      return res.status(400).json({ success: false, message: 'Query, aiAnswer, and rating (+1 or -1) are required' })
    }

    const isVerified = rating === 1

    const feedback = await prisma.aiFeedback.create({
      data: {
        query,
        aiAnswer,
        rating: rating > 0 ? 1 : -1,
        comment: comment || null,
        isVerified,
        adminId: adminId || null,
      },
    })

    return res.status(201).json({
      success: true,
      message: rating === 1 ? 'Thank you! High-rated answer fed into verified FAQ vector index.' : 'Feedback recorded.',
      data: feedback,
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export async function getAiFeedbackAnalyticsController(req: Request, res: Response) {
  try {
    const total = await prisma.aiFeedback.count()
    const positive = await prisma.aiFeedback.count({ where: { rating: 1 } })
    const negative = await prisma.aiFeedback.count({ where: { rating: -1 } })
    const verified = await prisma.aiFeedback.count({ where: { isVerified: true } })

    const recent = await prisma.aiFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return res.json({
      success: true,
      data: {
        total,
        positive,
        negative,
        verified,
        satisfactionRate: total > 0 ? parseFloat(((positive / total) * 100).toFixed(1)) : 100,
        recent,
      },
    })
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
