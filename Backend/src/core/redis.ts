import Redis from 'ioredis'
import { redisConfig } from '@/config/redis.config'

export const redis = new Redis(redisConfig)

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))
