import prisma from '@/core/prisma'
import { getCachedCmsPage, setCachedCmsPage } from '@/utils/cmsCache'

export interface PublicCmsResponse {
  slug: string
  title: string
  language: string
  contentHtml: string
  metaTitle: string
  metaDescription: string
  canonicalUrl?: string
  robots?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
}

export async function getPublicCmsPageService(
  slug: string,
  lang: string = 'en',
): Promise<PublicCmsResponse> {
  const targetLang = lang.toLowerCase()

  // 1. Check cache
  const cached = await getCachedCmsPage(slug, targetLang)
  if (cached && cached.contentHtml && cached.contentHtml.trim().length > 0) {
    return cached
  }

  // 2. Query database for PUBLISHED page matching slug
  const page = await prisma.cmsPage.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      deletedAt: null,
    },
    include: {
      translations: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  if (!page || page.translations.length === 0) {
    throw new Error('CMS_PAGE_NOT_FOUND')
  }

  // 3. Find matching translation or fallback to default language ('en') or first available non-empty translation
  let translation = page.translations.find(
    (t) =>
      t.languageCode.toLowerCase() === targetLang &&
      t.contentHtml &&
      t.contentHtml.trim().length > 0,
  )

  if (!translation) {
    translation = page.translations.find((t) => t.languageCode.toLowerCase() === targetLang)
  }

  if (!translation) {
    translation =
      page.translations.find(
        (t) =>
          t.languageCode.toLowerCase() === 'en' && t.contentHtml && t.contentHtml.trim().length > 0,
      ) ||
      page.translations.find((t) => t.languageCode.toLowerCase() === 'en') ||
      page.translations[0]
  }

  const responseData: PublicCmsResponse = {
    slug: page.slug,
    title: translation.title,
    language: translation.languageCode,
    contentHtml: translation.contentHtml,
    metaTitle: translation.metaTitle || translation.title,
    metaDescription: translation.metaDescription || '',
    canonicalUrl: translation.canonicalUrl || undefined,
    robots: translation.robots || 'index, follow',
    ogTitle: translation.ogTitle || translation.title,
    ogDescription: translation.ogDescription || translation.metaDescription || '',
    ogImage: translation.ogImage || undefined,
    twitterCard: translation.twitterCard || 'summary_large_image',
  }

  // 4. Cache response
  await setCachedCmsPage(slug, targetLang, responseData)

  return responseData
}
