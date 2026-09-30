import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import * as rbacCtrl from './rbac.controller'

const router = Router()

// All RBAC management routes require authentication and settings/rbac permission
router.use(authenticate)

// Modules
router.get('/modules', rbacCtrl.getModules)
router.post('/modules', requirePermission('settings.rbac'), rbacCtrl.createModule)
router.put('/modules/:id', requirePermission('settings.rbac'), rbacCtrl.updateModule)
router.delete('/modules/:id', requirePermission('settings.rbac'), rbacCtrl.deleteModule)

// Permissions
router.get('/permissions', rbacCtrl.getPermissions)
router.post('/permissions', requirePermission('settings.rbac'), rbacCtrl.createPermission)
router.post(
  '/permissions/auto-generate',
  requirePermission('settings.rbac'),
  rbacCtrl.autoGeneratePermissions,
)
router.delete('/permissions/:id', requirePermission('settings.rbac'), rbacCtrl.deletePermission)

// Roles & Role Permissions
router.get('/roles', rbacCtrl.getRoles)
router.get('/roles/:id', rbacCtrl.getRoleById)
router.post('/roles', requirePermission('settings.rbac'), rbacCtrl.createRole)
router.put('/roles/:id', requirePermission('settings.rbac'), rbacCtrl.updateRole)
router.post(
  '/roles/:id/permissions',
  requirePermission('settings.rbac'),
  rbacCtrl.assignPermissions,
)
router.delete('/roles/:id', requirePermission('settings.rbac'), rbacCtrl.deleteRole)

export default router
