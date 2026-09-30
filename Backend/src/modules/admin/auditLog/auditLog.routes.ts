import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import * as auditCtrl from './auditLog.controller'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission('settings.rbac'), auditCtrl.getAuditLogs)
router.get('/admins', requirePermission('settings.rbac'), auditCtrl.getAuditLogAdmins)

export default router
