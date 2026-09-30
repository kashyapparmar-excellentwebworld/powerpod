import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),

  DATABASE_URL: z.url(),

  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),   
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  ALLOWED_ORIGINS: z.string().default('http://localhost:8080'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),

  APP_NAME: z.string().default('Wasla'),
  SMTP_USER: z.email(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.email(),
})
console.log('envSchemaenvSchemaenvSchema', envSchema)

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.log('parsedparsedparsedparsed', parsed)
  console.error('Invalid environment variables:')
  console.error(z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data!
