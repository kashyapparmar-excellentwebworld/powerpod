import { Router } from 'express'

import authRouter from '@/modules/admin/auth/auth.routes'
import adminsRouter from '@/modules/admin/admins/admins.routes'
import rolesRouter from '@/modules/admin/roles/roles.routes'
import cmsRouter from '@/modules/admin/cms/cms.routes'
import versionRouter from '@/modules/admin/version/version.routes'
import rbacRouter from '@/modules/admin/rbac/rbac.routes'
import auditLogRouter from '@/modules/admin/auditLog/auditLog.routes'

import aiSettingsRouter from '@/modules/admin/aiSettings/aiSettings.routes'
import guidanceRouter from '@/modules/guidance/guidance.routes'
import aiChatRouter from '@/modules/ai/aiChat.routes'
import ticketsRouter from '@/modules/tickets/tickets.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/admins', adminsRouter)
router.use('/roles', rolesRouter)
router.use('/cms', cmsRouter)
router.use('/versions', versionRouter)
router.use('/rbac', rbacRouter)
router.use('/audit-logs', auditLogRouter)

router.use('/ai-settings', aiSettingsRouter)
router.use('/guidance', guidanceRouter)
router.use('/ai', aiChatRouter)
router.use('/tickets', ticketsRouter)

export default router
