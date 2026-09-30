import { AppPlatform } from '@prisma/client'
import { invalidateAppVersionCache } from '@/utils/versionCache'
import * as versionRepo from './version.repository'
import {
  CreateAppReleaseDto,
  UpdateAppReleaseDto,
  CreateTranslationDto,
  QueryAppVersionsDto,
  ToggleForceUpdateDto,
  ToggleMaintenanceDto,
  ConfigureRolloutDto,
} from './version.dto'

export async function getAppVersionsService(query: QueryAppVersionsDto) {
  return versionRepo.findAppVersions(query)
}

export async function getAppVersionByIdService(id: string) {
  const version = await versionRepo.findAppVersionById(id)
  if (!version) throw new Error('VERSION_NOT_FOUND')
  return version
}

export async function createAppReleaseService(dto: CreateAppReleaseDto, adminId?: string) {
  const release = await versionRepo.createAppRelease(dto, adminId)
  await invalidateAppVersionCache(dto.platform)
  return release
}

export async function updateAppReleaseService(
  id: string,
  dto: UpdateAppReleaseDto,
  adminId?: string,
) {
  const existing = await versionRepo.findAppVersionById(id)
  if (!existing) throw new Error('VERSION_NOT_FOUND')

  const updated = await versionRepo.updateAppRelease(id, dto, adminId)
  await invalidateAppVersionCache(existing.platform)
  return updated
}

export async function toggleForceUpdateService(
  id: string,
  dto: ToggleForceUpdateDto,
  adminId?: string,
) {
  const existing = await versionRepo.findAppVersionById(id)
  if (!existing) throw new Error('VERSION_NOT_FOUND')

  const updated = await versionRepo.updateAppRelease(id, { forceUpdate: dto.forceUpdate }, adminId)
  await invalidateAppVersionCache(existing.platform)
  return updated
}

export async function toggleMaintenanceModeService(
  id: string,
  dto: ToggleMaintenanceDto,
  adminId?: string,
) {
  const existing = await versionRepo.findAppVersionById(id)
  if (!existing) throw new Error('VERSION_NOT_FOUND')

  const updated = await versionRepo.updateAppRelease(
    id,
    {
      maintenanceMode: dto.maintenanceMode,
      maintenanceMessage: dto.maintenanceMessage,
    },
    adminId,
  )
  await invalidateAppVersionCache(existing.platform)
  return updated
}

export async function configureRolloutService(
  id: string,
  dto: ConfigureRolloutDto,
  adminId?: string,
) {
  const existing = await versionRepo.findAppVersionById(id)
  if (!existing) throw new Error('VERSION_NOT_FOUND')

  const updated = await versionRepo.updateAppRelease(
    id,
    { rolloutPercentage: dto.rolloutPercentage },
    adminId,
  )
  await invalidateAppVersionCache(existing.platform)
  return updated
}

export async function upsertTranslationService(id: string, dto: CreateTranslationDto) {
  const existing = await versionRepo.findAppVersionById(id)
  if (!existing) throw new Error('VERSION_NOT_FOUND')

  const translation = await versionRepo.upsertTranslation(id, dto)
  await invalidateAppVersionCache(existing.platform)
  return translation
}

export async function getVersionHistoryService(platform?: AppPlatform) {
  return versionRepo.findVersionHistory(platform)
}

export async function getAuditLogsService() {
  return versionRepo.findAuditLogs()
}

export async function getDashboardMetricsService() {
  return versionRepo.getVersionCheckStats()
}
