import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { env } from './src/config/env.config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node-dev --transpile-only -r tsconfig-paths/register prisma/seed.ts',
  },
  datasource: {
    url: env!.DATABASE_URL,
  },
})
