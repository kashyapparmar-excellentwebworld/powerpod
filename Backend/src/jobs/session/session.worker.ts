import { Worker } from 'bullmq'
import { workerConfig } from '@/config/bullmq.config'
import { QUEUES } from '@/constants/queues'
import { sessionCleanupQueue } from './session.queue'
import { sessionCleanupProcessor } from './session.processor'
import { logger } from '@/utils/logger'

// Schedule a repeatable daily cleanup. BullMQ deduplicates repeatable jobs by
// name + repeat key on restart, so this is safe to call every time the server starts.
sessionCleanupQueue.add(
  'daily-cleanup',
  {},
  {
    repeat: { every: 24 * 60 * 60 * 1000 },
    removeOnComplete: { count: 5 },
    removeOnFail: { count: 10 },
  },
)

export const sessionCleanupWorker = new Worker(
  QUEUES.SESSION_CLEANUP,
  sessionCleanupProcessor,
  workerConfig,
)

sessionCleanupWorker.on('completed', (job) =>
  logger.info({ jobId: job.id }, 'Session cleanup job completed'),
)
sessionCleanupWorker.on('failed', (job, err) =>
  logger.error({ jobId: job?.id, err }, 'Session cleanup job failed'),
)
