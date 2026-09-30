import { Router } from 'express'
import { getPublicCmsPage } from './publicCms.controller'

const router = Router()

// GET /cms/:slug?lang=en
router.get('/:slug', getPublicCmsPage)

export default router
