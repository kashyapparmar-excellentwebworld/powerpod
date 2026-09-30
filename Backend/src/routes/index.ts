import { Router } from 'express'
import adminRouter from '@/modules/admin'
import publicCmsRouter from '@/modules/public/cms/publicCms.routes'
import publicVersionRouter from '@/modules/public/version/publicVersion.routes'

const router = Router()

router.use('/admin', adminRouter)
router.use('/cms', publicCmsRouter)
router.use('/version', publicVersionRouter)

export default router
