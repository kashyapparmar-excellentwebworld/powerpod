import { Job } from 'bullmq'
import { sendEmail } from '@/utils/email'

export interface EmailJobData {
  to: string
  subject: string
  html: string
}

export async function emailProcessor(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html } = job.data
  await sendEmail({ to, subject, html })
}
