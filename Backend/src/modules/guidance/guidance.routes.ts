import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import {
  uploadGuidanceDocumentController,
  parseGuidanceFileController,
  getGuidanceDocumentsController,
  getGuidanceDocumentDetailsController,
  deleteGuidanceDocumentController,
} from './guidance.controller'

const router = Router()

router.use(authenticate)

router.post('/upload', uploadGuidanceDocumentController)
router.post('/parse-file', parseGuidanceFileController)
router.get('/documents', getGuidanceDocumentsController)
router.get('/documents/:id', getGuidanceDocumentDetailsController)
router.delete('/documents/:id', deleteGuidanceDocumentController)

export default router
