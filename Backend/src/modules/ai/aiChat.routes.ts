import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { aiSupportChatController } from './aiChat.controller'
import { submitAiFeedbackController, getAiFeedbackAnalyticsController } from './aiFeedback.controller'

const router = Router()

router.use(authenticate)

router.post('/chat', aiSupportChatController)
router.post('/feedback', submitAiFeedbackController)
router.get('/analytics', getAiFeedbackAnalyticsController)

export default router
