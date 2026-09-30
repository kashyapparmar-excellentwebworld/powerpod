import 'dotenv/config'
import { createApp } from './app'
import { env } from '@/config/env.config'

async function bootstrap(): Promise<void> {
  const app = await createApp()
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`)
  })
}

bootstrap()
