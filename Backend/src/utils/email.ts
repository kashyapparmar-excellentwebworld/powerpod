import nodemailer from 'nodemailer'
import type { SendMailOptions } from 'nodemailer'
import path from 'path'
import ejs from 'ejs'
import { env } from '@/config/env.config'

const VIEWS_DIR = path.join(__dirname, '../views')

const logoPath = path.join(VIEWS_DIR, '_assets/logo.png')

const logoAttachment: NonNullable<SendMailOptions['attachments']>[number] = {
  filename: 'logo.png',
  path: logoPath,
  cid: 'logo',
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export async function renderTemplate(
  templateName: string,
  data: Record<string, unknown> = {},
): Promise<string> {
  return ejs.renderFile(path.join(VIEWS_DIR, templateName), {
    ...data,
    logoUrl: 'cid:logo',
  })
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: SendMailOptions['attachments']
}): Promise<void> => {
  await transporter.sendMail({
    from: `"${env.APP_NAME}" <${env.SMTP_FROM}>`,
    to,
    subject,
    html,
    attachments: [logoAttachment, ...(attachments ?? [])],
  })
}
