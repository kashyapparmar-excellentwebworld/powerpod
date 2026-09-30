import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { isSuperAdmin } from '@/modules/admin/middlewares/isSuperAdmin.middleware'
import { getRolesDropdown } from './roles.controller'

const router = Router()

// ── Protected (superAdmin only) ───────────────────────────────────────────────
router.get('/dropdown', authenticate, isSuperAdmin, getRolesDropdown)

export default router
