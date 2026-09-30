import prisma from '@/core/prisma'
import { sha256 } from '@/utils/crypto'
import { EntityType, ClientType, Prisma } from '@prisma/client'

// Must stay in sync with JWT_REFRESH_EXPIRES_IN (default: 30d)
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export interface SessionContext {
  clientType: ClientType
  deviceInfo: Prisma.InputJsonObject | null
  ipAddress: string | null
}

export function parseDeviceInfo(userAgent: string | undefined): Prisma.InputJsonObject | null {
  if (!userAgent) return null
  return { ua: userAgent }
}

export async function createSession(
  entityType: EntityType,
  entityId: string,
  rawToken: string,
  context: SessionContext,
): Promise<void> {
  await prisma.session.create({
    data: {
      entityType,
      entityId,
      clientType: context.clientType,
      tokenHash: sha256(rawToken),
      deviceInfo: context.deviceInfo ?? undefined,
      ipAddress: context.ipAddress,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })
}

/**
 * Atomically revokes the old session and creates a new one (token rotation).
 * Returns false if the session is not found, already revoked, or expired —
 * so the caller can map it to a 401 without exposing why it failed.
 */
export async function rotateSession(
  rawOldToken: string,
  rawNewToken: string,
  deviceInfo: Prisma.InputJsonObject | null,
  ipAddress: string | null,
): Promise<boolean> {
  const oldHash = sha256(rawOldToken)
  const newHash = sha256(rawNewToken)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  try {
    await prisma.$transaction(async (tx) => {
      const session = await tx.session.findFirst({
        where: {
          tokenHash: oldHash,
          revokedAt: null,
          deletedAt: null,
          expiresAt: { gt: new Date() },
        },
      })

      if (!session) throw new Error('SESSION_NOT_FOUND')

      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      })

      await tx.session.create({
        data: {
          entityType: session.entityType,
          entityId: session.entityId,
          clientType: session.clientType,
          tokenHash: newHash,
          deviceInfo: deviceInfo ?? undefined,
          ipAddress,
          expiresAt,
        },
      })
    })

    return true
  } catch {
    return false
  }
}

export async function revokeSession(
  rawToken: string,
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  const tokenHash = sha256(rawToken)
  await prisma.session.updateMany({
    where: { tokenHash, entityType, entityId, revokedAt: null, deletedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllEntitySessions(
  entityType: EntityType,
  entityId: string,
): Promise<void> {
  await prisma.session.updateMany({
    where: { entityType, entityId, revokedAt: null, deletedAt: null },
    data: { revokedAt: new Date() },
  })
}
