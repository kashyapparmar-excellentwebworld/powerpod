import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'
import { initI18n } from '@/i18n'
import { languageMiddleware } from '@/middlewares/language.middleware'
import { translatorMiddleware } from '@/middlewares/translator.middleware'
import { errorHandler } from '@/middlewares/errorHandler.middleware'
import { rateLimiter } from '@/middlewares/rateLimiter.middleware'
import router from '@/routes'
import '@/jobs'

export async function createApp(): Promise<Application> {
  await initI18n()

  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
  app.use(compression())
  app.use(morgan('combined'))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(languageMiddleware)
  app.use(translatorMiddleware)

  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))
  app.use(rateLimiter)
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api/v1', router)
  app.use(errorHandler)

  return app
}
// $ git remote set-url origin git@github-js:HarshPrajapati25/project-setup.git