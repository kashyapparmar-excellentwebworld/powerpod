import { RedisOptions } from 'ioredis'
import { env } from './env.config'

function parseRedisUrl(url: string): RedisOptions {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
    tls: url.startsWith('rediss://') ? {} : undefined,
  }
}

const baseOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 10) return null
    return Math.min(times * 100, 3000)
  },
}

export const redisConfig: RedisOptions = env.REDIS_URL
  ? { ...baseOptions, ...parseRedisUrl(env.REDIS_URL) }
  : {
      ...baseOptions,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
    }
