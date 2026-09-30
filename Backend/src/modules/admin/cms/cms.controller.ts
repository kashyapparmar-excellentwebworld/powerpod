import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '@/utils/response'
import * as cmsService from './cms.service'
import {
  createCmsPageSchema,
  updateCmsPageSchema,
  createTranslationSchema,
  queryCmsPagesSchema,
} from './cms.validator'

export async function getCmsPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = queryCmsPagesSchema.parse(req.query)
    const result = await cmsService.getCmsPagesService(query)
    sendSuccess(res, result.data, req.translator.t('cms.list_success'), 200, result.pagination)
  } catch (error) {
    next(error)
  }
}

export async function getCmsPageById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const page = await cmsService.getCmsPageByIdService(id)
    sendSuccess(res, page, req.translator.t('cms.get_success'))
  } catch (error) {
    next(error)
  }
}

export async function createCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = createCmsPageSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const page = await cmsService.createCmsPageService(dto, adminId)
    sendSuccess(res, page, req.translator.t('cms.create_success'), 201)
  } catch (error) {
    next(error)
  }
}

export async function updateCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = updateCmsPageSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const page = await cmsService.updateCmsPageService(id, dto, adminId)
    sendSuccess(res, page, req.translator.t('cms.update_success'))
  } catch (error) {
    next(error)
  }
}

export async function deleteCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const result = await cmsService.deleteCmsPageService(id)
    sendSuccess(res, result, req.translator.t('cms.delete_success'))
  } catch (error) {
    next(error)
  }
}

export async function publishCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const { status } = req.body
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const page = await cmsService.publishCmsPageService(id, status || 'PUBLISHED', adminId)
    sendSuccess(res, page, req.translator.t('cms.publish_success'))
  } catch (error) {
    next(error)
  }
}

export async function duplicateCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const page = await cmsService.duplicateCmsPageService(id, adminId)
    sendSuccess(res, page, req.translator.t('cms.duplicate_success'), 201)
  } catch (error) {
    next(error)
  }
}

export async function upsertTranslation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const dto = createTranslationSchema.parse(req.body)
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const translation = await cmsService.upsertTranslationService(id, dto, adminId)
    sendSuccess(res, translation, req.translator.t('cms.translation_success'))
  } catch (error) {
    next(error)
  }
}

export async function deleteTranslation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const language = req.params.language as string
    const result = await cmsService.deleteTranslationService(id, language)
    sendSuccess(res, result, req.translator.t('cms.translation_delete_success'))
  } catch (error) {
    next(error)
  }
}

export async function getVersionHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const language = req.query.language as string
    const versions = await cmsService.getVersionHistoryService(id, language)
    sendSuccess(res, versions, req.translator.t('cms.versions_success'))
  } catch (error) {
    next(error)
  }
}

export async function restoreVersion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string
    const versionId = req.params.versionId as string
    const adminId = (req as any).user?.id || (req as any).admin?.id
    const result = await cmsService.restoreVersionService(id, versionId, adminId)
    sendSuccess(res, result, req.translator.t('cms.version_restore_success'))
  } catch (error) {
    next(error)
  }
}

export async function uploadCmsImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' })
      return
    }
    const imageUrl = `/uploads/cms/${req.file.filename}`
    sendSuccess(
      res,
      { url: imageUrl, filename: req.file.filename },
      'Image uploaded successfully',
      201,
    )
  } catch (error) {
    next(error)
  }
}
