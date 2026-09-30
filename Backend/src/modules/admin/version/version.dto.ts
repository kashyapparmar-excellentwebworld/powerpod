import { AppPlatform, AppVersionStatus } from '@prisma/client'

export interface CreateTranslationDto {
  languageCode: string
  title: string
  description: string
  updateButtonText?: string
  skipButtonText?: string
  maintenanceTitle?: string
  maintenanceDescription?: string
}

export interface CreateAppReleaseDto {
  platform: AppPlatform
  currentVersion: string
  minimumSupported: string
  recommendedVersion: string
  forceUpdate?: boolean
  maintenanceMode?: boolean
  maintenanceMessage?: string
  rolloutPercentage?: number
  playStoreUrl?: string
  appStoreUrl?: string
  webUrl?: string
  status?: AppVersionStatus
  translations: CreateTranslationDto[]
  releaseNotes?: string
}

export interface UpdateAppReleaseDto {
  currentVersion?: string
  minimumSupported?: string
  recommendedVersion?: string
  forceUpdate?: boolean
  maintenanceMode?: boolean
  maintenanceMessage?: string
  rolloutPercentage?: number
  playStoreUrl?: string
  appStoreUrl?: string
  webUrl?: string
  status?: AppVersionStatus
  releaseNotes?: string
}

export interface ToggleForceUpdateDto {
  forceUpdate: boolean
}

export interface ToggleMaintenanceDto {
  maintenanceMode: boolean
  maintenanceMessage?: string
}

export interface ConfigureRolloutDto {
  rolloutPercentage: number
}

export interface QueryAppVersionsDto {
  platform?: AppPlatform
  status?: AppVersionStatus
  page?: number
  limit?: number
}
