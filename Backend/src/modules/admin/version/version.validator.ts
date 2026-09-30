import { z } from 'zod'
import { isValidSemver } from '@/utils/versionSemver'

const semverString = z
  .string()
  .min(1, 'Version string is required')
  .refine((v) => isValidSemver(v), {
    message: 'Invalid semantic version format. Must follow x.y.z format (e.g. 1.4.0)',
  })

export const createTranslationSchema = z.object({
  languageCode: z.string().min(2).max(10).toLowerCase(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  updateButtonText: z.string().max(100).optional().default('Update Now'),
  skipButtonText: z.string().max(100).optional().default('Later'),
  maintenanceTitle: z.string().max(255).optional().default('Application Under Maintenance'),
  maintenanceDescription: z
    .string()
    .optional()
    .default('We are performing scheduled maintenance. Please try again later.'),
})

export const createAppReleaseSchema = z.object({
  platform: z.enum(['ANDROID', 'IOS', 'WEB']),
  currentVersion: semverString,
  minimumSupported: semverString,
  recommendedVersion: semverString,
  forceUpdate: z.boolean().optional().default(false),
  maintenanceMode: z.boolean().optional().default(false),
  maintenanceMessage: z.string().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional().default(100),
  playStoreUrl: z.string().url().or(z.literal('')).optional(),
  appStoreUrl: z.string().url().or(z.literal('')).optional(),
  webUrl: z.string().url().or(z.literal('')).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  translations: z.array(createTranslationSchema).min(1, 'At least one translation is required'),
  releaseNotes: z.string().optional(),
})

export const updateAppReleaseSchema = z.object({
  currentVersion: semverString.optional(),
  minimumSupported: semverString.optional(),
  recommendedVersion: semverString.optional(),
  forceUpdate: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
  playStoreUrl: z.string().url().or(z.literal('')).optional(),
  appStoreUrl: z.string().url().or(z.literal('')).optional(),
  webUrl: z.string().url().or(z.literal('')).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  releaseNotes: z.string().optional(),
})

export const toggleForceUpdateSchema = z.object({
  forceUpdate: z.boolean(),
})

export const toggleMaintenanceSchema = z.object({
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
})

export const configureRolloutSchema = z.object({
  rolloutPercentage: z
    .number()
    .int()
    .min(0, 'Rollout percentage must be between 0 and 100')
    .max(100),
})

export const queryAppVersionsSchema = z.object({
  platform: z.enum(['ANDROID', 'IOS', 'WEB']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
})
