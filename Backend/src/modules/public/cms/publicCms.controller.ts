import { Request, Response, NextFunction } from 'express'
import { getPublicCmsPageService } from './publicCms.service'

export async function getPublicCmsPage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params.slug as string
    const lang = (req.query.lang as string) || (req.language as string) || 'en'

    const pageData = await getPublicCmsPageService(slug, lang)

    res.status(200).json(pageData)
  } catch (error: any) {
    if (error.message === 'CMS_PAGE_NOT_FOUND') {
      res.status(404).json({
        error: 'Page Not Found',
        message: `CMS page '${req.params.slug}' was not found or is not published.`,
      })
      return
    }
    next(error)
  }
}
