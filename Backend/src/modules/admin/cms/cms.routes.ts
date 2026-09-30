import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate } from '@/middlewares/auth.middleware'
import {
  getCmsPages,
  getCmsPageById,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  publishCmsPage,
  duplicateCmsPage,
  upsertTranslation,
  deleteTranslation,
  getVersionHistory,
  restoreVersion,
  uploadCmsImage,
} from './cms.controller'

// Configure Multer for image uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cms')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `cms-img-${uniqueSuffix}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

const router = Router()

// All admin routes require authentication
router.use(authenticate)

router.get('/', getCmsPages)
router.post('/', createCmsPage)

router.post('/upload-image', upload.single('image'), uploadCmsImage)

router.get('/:id', getCmsPageById)
router.put('/:id', updateCmsPage)
router.delete('/:id', deleteCmsPage)

router.post('/:id/publish', publishCmsPage)
router.post('/:id/duplicate', duplicateCmsPage)

router.post('/:id/translations', upsertTranslation)
router.put('/:id/translations/:language', upsertTranslation)
router.delete('/:id/translations/:language', deleteTranslation)

router.get('/:id/versions', getVersionHistory)
router.post('/:id/versions/:versionId/restore', restoreVersion)

export default router
