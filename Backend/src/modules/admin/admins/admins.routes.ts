import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { isSuperAdmin } from '@/modules/admin/middlewares/isSuperAdmin.middleware'
import { validate } from '@/middlewares/validate.middleware'
import { createAdminSchema, updateAdminSchema } from './admins.validator'
import {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from './admins.controller'

const router = Router()

// ── Protected (superAdmin only) ───────────────────────────────────────────────
router.get('/', authenticate, isSuperAdmin, listAdmins)
router.get('/:id', authenticate, isSuperAdmin, getAdmin)
router.post('/', authenticate, isSuperAdmin, validate(createAdminSchema), createAdmin)
router.put('/:id', authenticate, isSuperAdmin, validate(updateAdminSchema), updateAdmin)
router.patch('/:id/status', authenticate, isSuperAdmin, toggleAdminStatus)
router.delete('/:id', authenticate, isSuperAdmin, deleteAdmin)

export default router
