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

export const createAdminSchema = (tr: Translator) =>
  z.object({
    fullName: z.string().min(1, tr.t('validation.full_name_required')).trim(),
    email: z
      .email(tr.t('validation.email_invalid'))
      .min(1, tr.t('validation.email_required'))
      .toLowerCase()
      .trim(),
    password: strongPassword(tr),
    roleId: z.string().uuid({ error: tr.t('validation.role_id_required') }),
    avatarUrl: z.url(tr.t('validation.avatar_url_invalid')).nullish(),
  })

export const updateAdminSchema = (tr: Translator) =>
  z.object({
    fullName: z.string().min(1, tr.t('validation.full_name_required')).trim().optional(),
    email: z.email(tr.t('validation.email_invalid')).toLowerCase().trim().optional(),
    roleId: z
      .string()
      .uuid({ error: tr.t('validation.role_id_required') })
      .optional(),
    avatarUrl: z.url(tr.t('validation.avatar_url_invalid')).nullish(),
  })

export type CreateAdminInput = z.infer<ReturnType<typeof createAdminSchema>>
export type UpdateAdminInput = z.infer<ReturnType<typeof updateAdminSchema>>
