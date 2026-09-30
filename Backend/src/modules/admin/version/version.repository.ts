import prisma from '@/core/prisma'
import { AppPlatform, AppVersionStatus, Prisma } from '@prisma/client'
import {
  CreateAppReleaseDto,
  UpdateAppReleaseDto,
  CreateTranslationDto,
  QueryAppVersionsDto,
} from './version.dto'

export async function findAppVersions(query: QueryAppVersionsDto) {
  const { platform, status, page = 1, limit = 10 } = query
  const skip = (page - 1) * limit

  const where: Prisma.AppVersionWhereInput = {
    deletedAt: null,
    ...(platform && { platform }),
    ...(status && { status }),
  }

  const [data, total] = await Promise.all([
    prisma.appVersion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        appTranslations: true,
        history: {
          orderBy: { releasedAt: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.appVersion.count({ where }),
  ])

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function findAppVersionById(id: string) {
  return prisma.appVersion.findFirst({
    where: { id, deletedAt: null },
    include: {
      appTranslations: true,
      history: {
        orderBy: { releasedAt: 'desc' },
      },
    },
  })
}

export async function findPublishedAppVersionByPlatform(platform: AppPlatform) {
  return prisma.appVersion.findFirst({
    where: {
      platform,
      status: 'PUBLISHED',
      deletedAt: null,
    },
    include: {
      appTranslations: true,
    },
  })
}

export async function createAppRelease(data: CreateAppReleaseDto, adminId?: string) {
  return prisma.$transaction(async (tx) => {
    // If status is PUBLISHED, unpublish existing published versions for this platform
    if (data.status === 'PUBLISHED') {
      await tx.appVersion.updateMany({
        where: { platform: data.platform, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      })
    }

    const version = await tx.appVersion.create({
      data: {
        platform: data.platform,
        currentVersion: data.currentVersion,
        minimumSupported: data.minimumSupported,
        recommendedVersion: data.recommendedVersion,
        forceUpdate: data.forceUpdate ?? false,
        maintenanceMode: data.maintenanceMode ?? false,
        maintenanceMessage: data.maintenanceMessage,
        rolloutPercentage: data.rolloutPercentage ?? 100,
        playStoreUrl: data.playStoreUrl,
        appStoreUrl: data.appStoreUrl,
        webUrl: data.webUrl,
        status: data.status || 'DRAFT',
        createdBy: adminId,
        updatedBy: adminId,
        appTranslations: {
          create: data.translations.map((tr) => ({
            languageCode: tr.languageCode.toLowerCase(),
            title: tr.title,
            description: tr.description,
            updateButtonText: tr.updateButtonText || 'Update Now',
            skipButtonText: tr.skipButtonText || 'Later',
            maintenanceTitle: tr.maintenanceTitle || 'Application Under Maintenance',
            maintenanceDescription:
              tr.maintenanceDescription ||
              'We are performing scheduled maintenance. Please try again later.',
          })),
        },
      },
      include: {
        appTranslations: true,
      },
    })

    // If published, record in release history & audit log
    if (data.status === 'PUBLISHED') {
      await tx.appVersionHistory.create({
        data: {
          appVersionId: version.id,
          platform: data.platform,
          version: data.currentVersion,
          releaseNotes: data.releaseNotes,
          createdBy: adminId,
        },
      })
    }

    await tx.appVersionAuditLog.create({
      data: {
        appVersionId: version.id,
        platform: data.platform,
        action: 'CREATE_RELEASE',
        changes: JSON.parse(JSON.stringify(version)),
        performedBy: adminId,
      },
    })

    return version
  })
}

export async function updateAppRelease(id: string, data: UpdateAppReleaseDto, adminId?: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.appVersion.findUnique({ where: { id } })
    if (!existing) throw new Error('VERSION_NOT_FOUND')

    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      await tx.appVersion.updateMany({
        where: { platform: existing.platform, status: 'PUBLISHED' },
        data: { status: 'ARCHIVED' },
      })
    }

    const updated = await tx.appVersion.update({
      where: { id },
      data: {
        ...(data.currentVersion && { currentVersion: data.currentVersion }),
        ...(data.minimumSupported && { minimumSupported: data.minimumSupported }),
        ...(data.recommendedVersion && { recommendedVersion: data.recommendedVersion }),
        ...(data.forceUpdate !== undefined && { forceUpdate: data.forceUpdate }),
        ...(data.maintenanceMode !== undefined && { maintenanceMode: data.maintenanceMode }),
        ...(data.maintenanceMessage !== undefined && {
          maintenanceMessage: data.maintenanceMessage,
        }),
        ...(data.rolloutPercentage !== undefined && { rolloutPercentage: data.rolloutPercentage }),
        ...(data.playStoreUrl !== undefined && { playStoreUrl: data.playStoreUrl }),
        ...(data.appStoreUrl !== undefined && { appStoreUrl: data.appStoreUrl }),
        ...(data.webUrl !== undefined && { webUrl: data.webUrl }),
        ...(data.status && { status: data.status }),
        updatedBy: adminId,
      },
      include: {
        appTranslations: true,
      },
    })

    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      await tx.appVersionHistory.create({
        data: {
          appVersionId: updated.id,
          platform: updated.platform,
          version: updated.currentVersion,
          releaseNotes: data.releaseNotes,
          createdBy: adminId,
        },
      })
    }

    await tx.appVersionAuditLog.create({
      data: {
        appVersionId: updated.id,
        platform: updated.platform,
        action: 'UPDATE_RELEASE',
        changes: JSON.parse(JSON.stringify(data)),
        performedBy: adminId,
      },
    })

    return updated
  })
}

export async function upsertTranslation(appVersionId: string, data: CreateTranslationDto) {
  return prisma.appVersionTranslation.upsert({
    where: {
      appVersionId_languageCode: {
        appVersionId,
        languageCode: data.languageCode.toLowerCase(),
      },
    },
    create: {
      appVersionId,
      languageCode: data.languageCode.toLowerCase(),
      title: data.title,
      description: data.description,
      updateButtonText: data.updateButtonText || 'Update Now',
      skipButtonText: data.skipButtonText || 'Later',
      maintenanceTitle: data.maintenanceTitle || 'Application Under Maintenance',
      maintenanceDescription:
        data.maintenanceDescription ||
        'We are performing scheduled maintenance. Please try again later.',
    },
    update: {
      title: data.title,
      description: data.description,
      updateButtonText: data.updateButtonText,
      skipButtonText: data.skipButtonText,
      maintenanceTitle: data.maintenanceTitle,
      maintenanceDescription: data.maintenanceDescription,
    },
  })
}

export async function findVersionHistory(platform?: AppPlatform) {
  return prisma.appVersionHistory.findMany({
    where: {
      ...(platform && { platform }),
    },
    orderBy: { releasedAt: 'desc' },
  })
}

export async function findAuditLogs(limit: number = 50) {
  return prisma.appVersionAuditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getVersionCheckStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayChecksCount, blockedDevicesCount, platformStatus] = await Promise.all([
    prisma.appVersionCheckLog.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.appVersionCheckLog.count({
      where: {
        createdAt: { gte: today },
        result: { in: ['FORCE_UPDATE', 'MAINTENANCE'] },
      },
    }),
    prisma.appVersion.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      include: { appTranslations: true },
    }),
  ])

  return {
    todayChecksCount,
    blockedDevicesCount,
    platforms: platformStatus,
  }
}

export async function logVersionCheck(data: {
  platform: AppPlatform
  version: string
  deviceId?: string
  userId?: string
  ip?: string
  result: string
}) {
  return prisma.appVersionCheckLog.create({
    data: {
      platform: data.platform,
      version: data.version,
      deviceId: data.deviceId,
      userId: data.userId,
      ip: data.ip,
      result: data.result,
    },
  })
}
