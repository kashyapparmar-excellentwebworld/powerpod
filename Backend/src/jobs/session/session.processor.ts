import { Job } from 'bullmq'
import prisma from '@/core/prisma'
import { logger } from '@/utils/logger'

// Hard-delete sessions that are either:
//   - naturally expired and never revoked
//   - revoked more than 7 days ago (audit retention window)
export async function sessionCleanupProcessor(_job: Job): Promise<void> {
  const auditCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { count } = await prisma.session.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() }, revokedAt: null }, { revokedAt: { lt: auditCutoff } }],
    },
  })

  logger.info({ count }, 'Session cleanup: removed expired and stale sessions')
}
