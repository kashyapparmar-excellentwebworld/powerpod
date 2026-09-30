export type { JwtPayload } from '@/types/jwt.types'

export interface EmailJobPayload {
  to: string
  type: 'password_reset' | 'welcome' | 'notification'
  data: Record<string, unknown>
}

export interface AdminRole {
  id: string
  name: string
  label: string
}

export interface AdminWithRole {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  lastLoginAt: Date | null
  createdAt: Date
  role: AdminRole
}
