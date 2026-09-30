import { Router } from 'express'
import { authenticate } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validate.middleware'
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './auth.validator'
import {
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} from './auth.controller'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), login)
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/verify-reset-token', validate(verifyResetTokenSchema), verifyResetToken)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

// ── Protected ─────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, validate(logoutSchema), logout)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile)
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword)

export default router
