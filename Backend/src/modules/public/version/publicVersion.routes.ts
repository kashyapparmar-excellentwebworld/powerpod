import { Router } from 'express'
import { checkAppVersion } from './publicVersion.controller'

const router = Router()

// Public version check endpoint: POST /api/v1/version/check
router.post('/check', checkAppVersion)

export default router
