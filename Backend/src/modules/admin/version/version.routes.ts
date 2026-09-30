import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import {
  getAppVersions,
  getAppVersionById,
  createAppRelease,
  updateAppRelease,
  toggleForceUpdate,
  toggleMaintenanceMode,
  configureRollout,
  upsertTranslation,
  getVersionHistory,
  getAuditLogs,
  getDashboardMetrics,
} from './version.controller'

const router = Router()

// All admin endpoints require authentication
router.use(authenticate)

router.get('/metrics', getDashboardMetrics)
router.get('/history', getVersionHistory)
router.get('/audit-logs', getAuditLogs)

router.get('/', getAppVersions)
router.post('/', createAppRelease)

router.get('/:id', getAppVersionById)
router.put('/:id', updateAppRelease)

router.patch('/:id/force-update', toggleForceUpdate)
router.patch('/:id/maintenance', toggleMaintenanceMode)
router.patch('/:id/rollout', configureRollout)

router.post('/:id/translations', upsertTranslation)

export default router
