import { sanitizeContentHtml } from '@/utils/sanitizer'
import { invalidateCmsPageCache } from '@/utils/cmsCache'
import * as cmsRepo from './cms.repository'
import {
  CreateCmsPageDto,
  UpdateCmsPageDto,
  CreateTranslationDto,
  CmsPageQueryDto,
} from './cms.dto'

export async function getCmsPagesService(query: CmsPageQueryDto) {
  return cmsRepo.findCmsPages(query)
}

export async function getCmsPageByIdService(id: string) {
  const page = await cmsRepo.findCmsPageById(id)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }
  return page
}

export async function createCmsPageService(dto: CreateCmsPageDto, adminId?: string) {
  // Check if slug already exists
  const existing = await cmsRepo.findCmsPageBySlug(dto.slug)
  if (existing) {
    throw new Error('SLUG_ALREADY_EXISTS')
  }

  // Sanitize content HTML
  const sanitizedData: CreateCmsPageDto = {
    ...dto,
    contentHtml: sanitizeContentHtml(dto.contentHtml),
  }

  const newPage = await cmsRepo.createCmsPage(sanitizedData, adminId)
  return newPage
}

export async function updateCmsPageService(id: string, dto: UpdateCmsPageDto, adminId?: string) {
  const page = await cmsRepo.findCmsPageById(id)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  if (dto.slug && dto.slug !== page.slug) {
    const existing = await cmsRepo.findCmsPageBySlug(dto.slug)
    if (existing) {
      throw new Error('SLUG_ALREADY_EXISTS')
    }
  }

  const updatedPage = await cmsRepo.updateCmsPage(id, dto, adminId)

  // Invalidate cache for public page
  await invalidateCmsPageCache(page.slug)
  if (dto.slug && dto.slug !== page.slug) {
    await invalidateCmsPageCache(dto.slug)
  }

  return updatedPage
}

export async function deleteCmsPageService(id: string) {
  const page = await cmsRepo.findCmsPageById(id)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  await cmsRepo.deleteCmsPage(id)
  await invalidateCmsPageCache(page.slug)
  return { success: true }
}

export async function publishCmsPageService(
  id: string,
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
  adminId?: string,
) {
  const page = await cmsRepo.findCmsPageById(id)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  const updated = await cmsRepo.updateCmsPage(id, { status }, adminId)
  await invalidateCmsPageCache(page.slug)
  return updated
}

export async function duplicateCmsPageService(id: string, adminId?: string) {
  const page = await cmsRepo.findCmsPageById(id)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  const newSlug = `${page.slug}-copy-${Date.now().toString().slice(-4)}`
  const firstTranslation = page.translations[0]

  if (!firstTranslation) {
    throw new Error('NO_TRANSLATIONS_FOUND')
  }

  const newPage = await cmsRepo.createCmsPage(
    {
      slug: newSlug,
      status: 'DRAFT',
      languageCode: firstTranslation.languageCode,
      title: `${firstTranslation.title} (Copy)`,
      contentHtml: firstTranslation.contentHtml,
      metaTitle: firstTranslation.metaTitle || undefined,
      metaDescription: firstTranslation.metaDescription || undefined,
    },
    adminId,
  )

  // Copy remaining translations if any
  for (let i = 1; i < page.translations.length; i++) {
    const tr = page.translations[i]
    await cmsRepo.upsertCmsPageTranslation(
      newPage.id,
      {
        languageCode: tr.languageCode,
        title: tr.title,
        contentHtml: tr.contentHtml,
        metaTitle: tr.metaTitle || undefined,
        metaDescription: tr.metaDescription || undefined,
      },
      adminId,
    )
  }

  return cmsRepo.findCmsPageById(newPage.id)
}

export async function upsertTranslationService(
  pageId: string,
  dto: CreateTranslationDto,
  adminId?: string,
) {
  const page = await cmsRepo.findCmsPageById(pageId)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  const sanitizedDto: CreateTranslationDto = {
    ...dto,
    contentHtml: sanitizeContentHtml(dto.contentHtml),
  }

  const translation = await cmsRepo.upsertCmsPageTranslation(pageId, sanitizedDto, adminId)
  await invalidateCmsPageCache(page.slug)
  return translation
}

export async function deleteTranslationService(pageId: string, languageCode: string) {
  const page = await cmsRepo.findCmsPageById(pageId)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  await cmsRepo.deleteCmsPageTranslation(pageId, languageCode)
  await invalidateCmsPageCache(page.slug)
  return { success: true }
}

export async function getVersionHistoryService(pageId: string, languageCode?: string) {
  const page = await cmsRepo.findCmsPageById(pageId)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }
  return cmsRepo.findCmsPageVersions(pageId, languageCode)
}

export async function restoreVersionService(pageId: string, versionId: string, adminId?: string) {
  const page = await cmsRepo.findCmsPageById(pageId)
  if (!page) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  const restored = await cmsRepo.restoreCmsPageVersion(pageId, versionId, adminId)
  await invalidateCmsPageCache(page.slug)
  return restored
}
