import { Worker } from 'bullmq'
import { workerConfig } from '@/config/bullmq.config'
import { QUEUES } from '@/constants/queues'
import { emailProcessor } from './email.processor'

export const emailWorker = new Worker(QUEUES.EMAIL, emailProcessor, workerConfig)

emailWorker.on('completed', (job) => console.log(`Email job ${job.id} done`))
emailWorker.on('failed', (job, err) => console.error(`Email job ${job?.id} failed:`, err))
