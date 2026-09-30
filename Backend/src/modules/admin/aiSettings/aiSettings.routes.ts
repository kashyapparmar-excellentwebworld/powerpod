import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import {
  getAiConfigController,
  updateAiConfigController,
  testGeminiApiKeyController,
} from './aiSettings.controller'

const router = Router()

router.use(authenticate)

router.get('/', getAiConfigController)
router.put('/', updateAiConfigController)
router.post('/test-key', testGeminiApiKeyController)

export default router
