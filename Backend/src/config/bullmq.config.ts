import { QueueOptions, WorkerOptions } from 'bullmq'
import { redisConfig } from './redis.config'

export const queueConfig: QueueOptions = {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
}

export const workerConfig: WorkerOptions = {
  connection: redisConfig,
  concurrency: 5,
}
