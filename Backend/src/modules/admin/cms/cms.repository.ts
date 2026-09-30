import prisma from '@/core/prisma'
import { Prisma, CmsPageStatus } from '@prisma/client'
import {
  CreateCmsPageDto,
  UpdateCmsPageDto,
  CreateTranslationDto,
  CmsPageQueryDto,
} from './cms.dto'

export async function findCmsPages(query: CmsPageQueryDto) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    language,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query

  const skip = (page - 1) * limit

  const where: Prisma.CmsPageWhereInput = {
    deletedAt: null,
    ...(status && { status: status as CmsPageStatus }),
    ...(search && {
      OR: [
        { slug: { contains: search, mode: 'insensitive' } },
        {
          translations: {
            some: {
              title: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ],
    }),
    ...(language && {
      translations: {
        some: {
          languageCode: language.toLowerCase(),
        },
      },
    }),
  }

  const [pages, total] = await Promise.all([
    prisma.cmsPage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        translations: true,
      },
    }),
    prisma.cmsPage.count({ where }),
  ])

  return {
    data: pages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function findCmsPageById(id: string) {
  return prisma.cmsPage.findFirst({
    where: { id, deletedAt: null },
    include: {
      translations: true,
      versions: {
        orderBy: { version: 'desc' },
        take: 20,
      },
    },
  })
}

export async function findCmsPageBySlug(slug: string) {
  return prisma.cmsPage.findFirst({
    where: { slug, deletedAt: null },
    include: {
      translations: true,
    },
  })
}

export async function createCmsPage(data: CreateCmsPageDto, adminId?: string) {
  return prisma.$transaction(async (tx) => {
    const page = await tx.cmsPage.create({
      data: {
        slug: data.slug,
        status: (data.status as CmsPageStatus) || 'DRAFT',
        createdBy: adminId,
        updatedBy: adminId,
      },
    })

    const translation = await tx.cmsPageTranslation.create({
      data: {
        pageId: page.id,
        languageCode: data.languageCode.toLowerCase(),
        title: data.title,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        robots: data.robots || 'index, follow',
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        twitterCard: data.twitterCard || 'summary_large_image',
        publishedVersion: 1,
      },
    })

    await tx.cmsPageVersion.create({
      data: {
        pageId: page.id,
        languageCode: data.languageCode.toLowerCase(),
        version: 1,
        title: data.title,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        createdBy: adminId,
      },
    })

    return { ...page, translations: [translation] }
  })
}

export async function updateCmsPage(id: string, data: UpdateCmsPageDto, adminId?: string) {
  return prisma.cmsPage.update({
    where: { id },
    data: {
      ...(data.slug && { slug: data.slug }),
      ...(data.status && { status: data.status as CmsPageStatus }),
      updatedBy: adminId,
    },
    include: {
      translations: true,
    },
  })
}

export async function deleteCmsPage(id: string) {
  return prisma.cmsPage.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })
}

export async function upsertCmsPageTranslation(
  pageId: string,
  data: CreateTranslationDto,
  adminId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const lang = data.languageCode.toLowerCase()

    const existing = await tx.cmsPageTranslation.findUnique({
      where: {
        pageId_languageCode: {
          pageId,
          languageCode: lang,
        },
      },
    })

    const nextVersion = (existing?.publishedVersion || 0) + 1

    const translation = await tx.cmsPageTranslation.upsert({
      where: {
        pageId_languageCode: {
          pageId,
          languageCode: lang,
        },
      },
      create: {
        pageId,
        languageCode: lang,
        title: data.title,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        robots: data.robots || 'index, follow',
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        twitterCard: data.twitterCard || 'summary_large_image',
        publishedVersion: 1,
      },
      update: {
        title: data.title,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
        robots: data.robots,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        twitterCard: data.twitterCard,
        publishedVersion: nextVersion,
      },
    })

    await tx.cmsPageVersion.create({
      data: {
        pageId,
        languageCode: lang,
        version: nextVersion,
        title: data.title,
        contentHtml: data.contentHtml,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        createdBy: adminId,
      },
    })

    return translation
  })
}

export async function deleteCmsPageTranslation(pageId: string, languageCode: string) {
  return prisma.cmsPageTranslation.delete({
    where: {
      pageId_languageCode: {
        pageId,
        languageCode: languageCode.toLowerCase(),
      },
    },
  })
}

export async function findCmsPageVersions(pageId: string, languageCode?: string) {
  return prisma.cmsPageVersion.findMany({
    where: {
      pageId,
      ...(languageCode && { languageCode: languageCode.toLowerCase() }),
    },
    orderBy: { version: 'desc' },
  })
}

export async function restoreCmsPageVersion(pageId: string, versionId: string, adminId?: string) {
  return prisma.$transaction(async (tx) => {
    const targetVersion = await tx.cmsPageVersion.findUnique({
      where: { id: versionId },
    })

    if (!targetVersion || targetVersion.pageId !== pageId) {
      throw new Error('VERSION_NOT_FOUND')
    }

    const currentTranslation = await tx.cmsPageTranslation.findUnique({
      where: {
        pageId_languageCode: {
          pageId,
          languageCode: targetVersion.languageCode,
        },
      },
    })

    const newVersionNum = (currentTranslation?.publishedVersion || 0) + 1

    const updatedTranslation = await tx.cmsPageTranslation.upsert({
      where: {
        pageId_languageCode: {
          pageId,
          languageCode: targetVersion.languageCode,
        },
      },
      create: {
        pageId,
        languageCode: targetVersion.languageCode,
        title: targetVersion.title,
        contentHtml: targetVersion.contentHtml,
        metaTitle: targetVersion.metaTitle,
        metaDescription: targetVersion.metaDescription,
        publishedVersion: newVersionNum,
      },
      update: {
        title: targetVersion.title,
        contentHtml: targetVersion.contentHtml,
        metaTitle: targetVersion.metaTitle,
        metaDescription: targetVersion.metaDescription,
        publishedVersion: newVersionNum,
      },
    })

    await tx.cmsPageVersion.create({
      data: {
        pageId,
        languageCode: targetVersion.languageCode,
        version: newVersionNum,
        title: targetVersion.title,
        contentHtml: targetVersion.contentHtml,
        metaTitle: targetVersion.metaTitle,
        metaDescription: targetVersion.metaDescription,
        createdBy: adminId,
      },
    })

    return updatedTranslation
  })
}
