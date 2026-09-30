import { Queue } from 'bullmq'
import { queueConfig } from '@/config/bullmq.config'
import { QUEUES } from '@/constants/queues'

export const emailQueue = new Queue(QUEUES.EMAIL, queueConfig)
