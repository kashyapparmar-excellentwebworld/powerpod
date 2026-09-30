import { redis } from '@/core/redis'
import { AppPlatform } from '@prisma/client'

const CACHE_PREFIX = 'app_version:'
const CACHE_TTL_SECONDS = 3600 // 1 hour

const memoryCache = new Map<string, { value: string; expiresAt: number }>()

export async function getCachedAppVersion(platform: AppPlatform): Promise<any | null> {
  const key = `${CACHE_PREFIX}${platform}`

  if (redis) {
    try {
      const data = await redis.get(key)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.warn('Redis get failed, using memory cache', e)
    }
  }

  const cached = memoryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return JSON.parse(cached.value)
  }

  return null
}

export async function setCachedAppVersion(platform: AppPlatform, data: any): Promise<void> {
  const key = `${CACHE_PREFIX}${platform}`
  const stringified = JSON.stringify(data)

  if (redis) {
    try {
      await redis.setex(key, CACHE_TTL_SECONDS, stringified)
    } catch (e) {
      console.warn('Redis setex failed', e)
    }
  }

  memoryCache.set(key, {
    value: stringified,
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
  })
}

export async function invalidateAppVersionCache(platform?: AppPlatform): Promise<void> {
  if (platform) {
    const key = `${CACHE_PREFIX}${platform}`
    if (redis) {
      try {
        await redis.del(key)
      } catch (e) {
        console.warn('Redis cache invalidation failed', e)
      }
    }
    memoryCache.delete(key)
  } else {
    // Invalidate all platforms
    if (redis) {
      try {
        const keys = await redis.keys(`${CACHE_PREFIX}*`)
        if (keys.length > 0) await redis.del(...keys)
      } catch (e) {
        console.warn('Redis clear failed', e)
      }
    }
    memoryCache.clear()
  }
}
