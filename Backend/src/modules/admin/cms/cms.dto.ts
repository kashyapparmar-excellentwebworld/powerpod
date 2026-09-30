export type CmsPageStatusType = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface CreateCmsPageDto {
  slug: string
  status?: CmsPageStatusType
  languageCode: string
  title: string
  contentHtml: string
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  robots?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  twitterCard?: string | null
}

export interface UpdateCmsPageDto {
  slug?: string
  status?: CmsPageStatusType
}

export interface CreateTranslationDto {
  languageCode: string
  title: string
  contentHtml: string
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  robots?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  twitterCard?: string | null
}

export interface CmsPageQueryDto {
  page?: number
  limit?: number
  search?: string
  status?: CmsPageStatusType
  language?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
