import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { env } from '@/config/env.config'
import { logger } from '@/utils/logger'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
})

export async function connectDatabase(): Promise<void> {
  await prisma.$connect()
  logger.info('Database connected')
}

export { prisma }
export default prisma
