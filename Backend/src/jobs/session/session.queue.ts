import { Queue } from 'bullmq'
import { queueConfig } from '@/config/bullmq.config'
import { QUEUES } from '@/constants/queues'

export const sessionCleanupQueue = new Queue(QUEUES.SESSION_CLEANUP, queueConfig)
