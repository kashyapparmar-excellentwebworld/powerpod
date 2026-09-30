import { z } from 'zod'

// Regex for valid slugs: lowercase letters, numbers, and hyphens only
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createCmsPageSchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(150, 'Slug cannot exceed 150 characters')
    .regex(
      SLUG_REGEX,
      'Slug must contain only lowercase letters, numbers, and hyphens (e.g. privacy-policy)',
    ),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  languageCode: z
    .string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10, 'Language code cannot exceed 10 characters')
    .toLowerCase(),
  title: z.string().min(1, 'Title is required').max(255),
  contentHtml: z.string().min(1, 'Content HTML is required'),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z
    .string()
    .url('Canonical URL must be a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  robots: z.string().optional().nullable().default('index, follow'),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  twitterCard: z.string().optional().nullable().default('summary_large_image'),
})

export const updateCmsPageSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(150)
    .regex(SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

export const createTranslationSchema = z.object({
  languageCode: z
    .string()
    .min(2, 'Language code must be at least 2 characters')
    .max(10)
    .toLowerCase(),
  title: z.string().min(1, 'Title is required').max(255),
  contentHtml: z.string().min(1, 'Content HTML is required'),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z
    .string()
    .url('Canonical URL must be a valid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  robots: z.string().optional().nullable().default('index, follow'),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  twitterCard: z.string().optional().nullable().default('summary_large_image'),
})

export const queryCmsPagesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  language: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})
