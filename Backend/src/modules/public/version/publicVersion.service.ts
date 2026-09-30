import { AppPlatform } from '@prisma/client'
import { getCachedAppVersion, setCachedAppVersion } from '@/utils/versionCache'
import { compareSemver, isVersionLessThan } from '@/utils/versionSemver'
import { isUserInRolloutBucket } from '@/utils/rolloutHash'
import prisma from '@/core/prisma'

export interface VersionCheckRequest {
  platform: string
  version: string
  language?: string
  deviceId?: string
  userId?: string
  ip?: string
}

export interface VersionCheckResponse {
  status: 'success'
  resultState: 'MAINTENANCE' | 'FORCE_UPDATE' | 'OPTIONAL_UPDATE' | 'UP_TO_DATE'
  forceUpdate: boolean
  optionalUpdate: boolean
  maintenance: boolean
  latestVersion: string
  minimumVersion: string
  recommendedVersion: string
  title: string
  message: string
  updateUrl: string
  buttonText: string
  skipButtonText?: string
}

export async function checkAppVersionService(
  reqDto: VersionCheckRequest,
): Promise<VersionCheckResponse> {
  const platformStr = reqDto.platform.toUpperCase()
  if (!['ANDROID', 'IOS', 'WEB'].includes(platformStr)) {
    throw new Error('INVALID_PLATFORM')
  }

  const platform = platformStr as AppPlatform
  const reqLang = (reqDto.language || 'en').toLowerCase()
  const reqVersion = reqDto.version.trim()

  // 1. Get published version config (with caching)
  let appVersionData = await getCachedAppVersion(platform)

  if (!appVersionData) {
    appVersionData = await prisma.appVersion.findFirst({
      where: {
        platform,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        appTranslations: true,
      },
    })

    if (appVersionData) {
      await setCachedAppVersion(platform, appVersionData)
    }
  }

  // If no release found, default to Up to Date
  if (!appVersionData) {
    return {
      status: 'success',
      resultState: 'UP_TO_DATE',
      forceUpdate: false,
      optionalUpdate: false,
      maintenance: false,
      latestVersion: reqVersion,
      minimumVersion: reqVersion,
      recommendedVersion: reqVersion,
      title: 'Up to Date',
      message: 'You are using the latest version.',
      updateUrl: '',
      buttonText: 'OK',
    }
  }

  // 2. Select appropriate translation or fallback to English / first available
  const translations: any[] = appVersionData.appTranslations || []
  let tr = translations.find((t: any) => t.languageCode === reqLang)
  if (!tr) {
    tr = translations.find((t: any) => t.languageCode === 'en') || translations[0] || {}
  }

  // Determine update URL for platform
  const updateUrl =
    platform === 'ANDROID'
      ? appVersionData.playStoreUrl || ''
      : platform === 'IOS'
        ? appVersionData.appStoreUrl || ''
        : appVersionData.webUrl || ''

  // 3. Maintenance Mode Check
  if (appVersionData.maintenanceMode) {
    await logCheck(platform, reqVersion, reqDto, 'MAINTENANCE')
    return {
      status: 'success',
      resultState: 'MAINTENANCE',
      forceUpdate: false,
      optionalUpdate: false,
      maintenance: true,
      latestVersion: appVersionData.currentVersion,
      minimumVersion: appVersionData.minimumSupported,
      recommendedVersion: appVersionData.recommendedVersion,
      title: tr.maintenanceTitle || 'Application Under Maintenance',
      message:
        appVersionData.maintenanceMessage || tr.maintenanceDescription || 'Please try again later.',
      updateUrl,
      buttonText: 'Retry',
    }
  }

  // 4. Force Update Check
  // Force update triggered if:
  // - appVersion.forceUpdate === true
  // - OR reqVersion < minimumSupported
  const isForceUpdateRequired =
    appVersionData.forceUpdate || isVersionLessThan(reqVersion, appVersionData.minimumSupported)

  if (isForceUpdateRequired) {
    await logCheck(platform, reqVersion, reqDto, 'FORCE_UPDATE')
    return {
      status: 'success',
      resultState: 'FORCE_UPDATE',
      forceUpdate: true,
      optionalUpdate: false,
      maintenance: false,
      latestVersion: appVersionData.currentVersion,
      minimumVersion: appVersionData.minimumSupported,
      recommendedVersion: appVersionData.recommendedVersion,
      title: tr.title || 'Update Required',
      message: tr.description || 'A newer version of the application is required to continue.',
      updateUrl,
      buttonText: tr.updateButtonText || 'Update Now',
    }
  }

  // 5. Optional Update & Staged Rollout Check
  // Optional update triggered if:
  // - reqVersion < recommendedVersion (or currentVersion)
  // - AND user/device ID falls inside rollout percentage bucket
  const isBelowRecommended = isVersionLessThan(reqVersion, appVersionData.recommendedVersion)
  const identifier = reqDto.deviceId || reqDto.userId
  const inRolloutBucket = isUserInRolloutBucket(identifier, appVersionData.rolloutPercentage)

  if (isBelowRecommended && inRolloutBucket) {
    await logCheck(platform, reqVersion, reqDto, 'OPTIONAL_UPDATE')
    return {
      status: 'success',
      resultState: 'OPTIONAL_UPDATE',
      forceUpdate: false,
      optionalUpdate: true,
      maintenance: false,
      latestVersion: appVersionData.currentVersion,
      minimumVersion: appVersionData.minimumSupported,
      recommendedVersion: appVersionData.recommendedVersion,
      title: tr.title || 'New Version Available',
      message:
        tr.description || 'A new update is available with performance improvements and bug fixes.',
      updateUrl,
      buttonText: tr.updateButtonText || 'Update Now',
      skipButtonText: tr.skipButtonText || 'Later',
    }
  }

  // 6. Up To Date
  await logCheck(platform, reqVersion, reqDto, 'UP_TO_DATE')
  return {
    status: 'success',
    resultState: 'UP_TO_DATE',
    forceUpdate: false,
    optionalUpdate: false,
    maintenance: false,
    latestVersion: appVersionData.currentVersion,
    minimumVersion: appVersionData.minimumSupported,
    recommendedVersion: appVersionData.recommendedVersion,
    title: 'Up to Date',
    message: 'Your application is up to date.',
    updateUrl,
    buttonText: 'OK',
  }
}

async function logCheck(
  platform: AppPlatform,
  version: string,
  reqDto: VersionCheckRequest,
  result: string,
) {
  try {
    await prisma.appVersionCheckLog.create({
      data: {
        platform,
        version,
        deviceId: reqDto.deviceId,
        userId: reqDto.userId,
        ip: reqDto.ip,
        result,
      },
    })
  } catch (err) {
    console.error('Failed to log version check:', err)
  }
}
