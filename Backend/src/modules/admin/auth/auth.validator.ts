import { z } from 'zod'
import { Translator } from '@/types/translator.types'

const strongPassword = (tr: Translator) =>
  z
    .string()
    .min(8, tr.t('validation.password_min'))
    .regex(/[A-Z]/, tr.t('validation.password_weak'))
    .regex(/[a-z]/, tr.t('validation.password_weak'))
    .regex(/[0-9]/, tr.t('validation.password_weak'))
    .regex(/[^A-Za-z0-9]/, tr.t('validation.password_weak'))

export const loginSchema = (tr: Translator) =>
  z.object({
    email: z
      .email(tr.t('validation.email_invalid'))
      .min(1, tr.t('validation.email_required'))
      .toLowerCase()
      .trim(),
    password: z.string().min(1, tr.t('validation.password_required')),
  })

export const refreshTokenSchema = (tr: Translator) =>
  z.object({
    refreshToken: z.string().min(1, tr.t('validation.token_required')),
  })

export const forgotPasswordSchema = (tr: Translator) =>
  z.object({
    email: z
      .email(tr.t('validation.email_invalid'))
      .min(1, tr.t('validation.email_required'))
      .toLowerCase()
      .trim(),
  })

export const verifyResetTokenSchema = (tr: Translator) =>
  z.object({
    token: z.string().min(1, tr.t('validation.token_required')),
  })

export const resetPasswordSchema = (tr: Translator) =>
  z.object({
    token: z.string().min(1, tr.t('validation.token_required')),
    newPassword: strongPassword(tr),
  })

export const updateProfileSchema = (tr: Translator) =>
  z.object({
    fullName: z.string().min(1, tr.t('validation.full_name_required')).optional(),
    avatarUrl: z.url(tr.t('validation.avatar_url_invalid')).nullish(),
  })

export const logoutSchema = (tr: Translator) =>
  z.object({
    refreshToken: z.string().min(1, tr.t('validation.token_required')),
  })

export const changePasswordSchema = (tr: Translator) =>
  z.object({
    currentPassword: z.string().min(1, tr.t('validation.current_password_required')),
    newPassword: strongPassword(tr),
  })

export type VerifyResetTokenInput = z.infer<ReturnType<typeof verifyResetTokenSchema>>
export type LoginInput = z.infer<ReturnType<typeof loginSchema>>
export type RefreshTokenInput = z.infer<ReturnType<typeof refreshTokenSchema>>
export type LogoutInput = z.infer<ReturnType<typeof logoutSchema>>
export type ForgotPasswordInput = z.infer<ReturnType<typeof forgotPasswordSchema>>
export type ResetPasswordInput = z.infer<ReturnType<typeof resetPasswordSchema>>
export type UpdateProfileInput = z.infer<ReturnType<typeof updateProfileSchema>>
export type ChangePasswordInput = z.infer<ReturnType<typeof changePasswordSchema>>
