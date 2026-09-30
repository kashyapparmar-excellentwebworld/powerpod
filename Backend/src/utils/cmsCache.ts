import { redis } from '@/core/redis'

const CACHE_PREFIX = 'cms_page:'
const CACHE_TTL_SECONDS = 3600 // 1 hour

// In-memory fallback cache if Redis is not configured/available
const memoryCache = new Map<string, { value: string; expiresAt: number }>()

export async function getCachedCmsPage(slug: string, lang: string): Promise<any | null> {
  const key = `${CACHE_PREFIX}${slug}:${lang}`

  if (redis) {
    try {
      const data = await redis.get(key)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.warn('Redis get failed, falling back to memory cache', e)
    }
  }

  const cached = memoryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return JSON.parse(cached.value)
  }

  return null
}

export async function setCachedCmsPage(slug: string, lang: string, data: any): Promise<void> {
  // Never cache responses with empty contentHtml
  if (!data || !data.contentHtml || data.contentHtml.trim().length === 0) {
    return
  }

  const key = `${CACHE_PREFIX}${slug}:${lang}`
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

export async function invalidateCmsPageCache(slug?: string): Promise<void> {
  if (redis) {
    try {
      if (slug) {
        const keys = await redis.keys(`${CACHE_PREFIX}${slug}:*`)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        const keys = await redis.keys(`${CACHE_PREFIX}*`)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      }
    } catch (e) {
      console.warn('Redis cache invalidation failed', e)
    }
  }

  if (slug) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`${CACHE_PREFIX}${slug}:`)) {
        memoryCache.delete(key)
      }
    }
  } else {
    memoryCache.clear()
  }
}
