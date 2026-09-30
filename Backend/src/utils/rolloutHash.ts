import crypto from 'crypto'

/**
 * Deterministic hash mapping string (deviceId or userId) to an integer 0-99.
 * Ensures identical device/user ID consistently gets included or excluded in rollout buckets.
 */
export function getRolloutBucket(identifier: string): number {
  if (!identifier) return Math.floor(Math.random() * 100)

  const hash = crypto.createHash('md5').update(identifier.trim().toLowerCase()).digest('hex')
  const num = parseInt(hash.substring(0, 8), 16)
  return num % 100
}

/**
 * Evaluates whether a user/device falls within rollout percentage (0 to 100).
 */
export function isUserInRolloutBucket(
  identifier: string | undefined,
  rolloutPercentage: number,
): boolean {
  if (rolloutPercentage >= 100) return true
  if (rolloutPercentage <= 0) return false
  if (!identifier) return true

  const bucket = getRolloutBucket(identifier)
  return bucket < rolloutPercentage
}
