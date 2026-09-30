import type { PaginatedData } from '@/utils/pagination'

export interface AdminRoleDto {
  id: string
  name: string
  label: string | null
}

export interface AdminDto {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  role: AdminRoleDto
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type AdminListDto = PaginatedData<'admins', AdminDto>

export interface AdminStatusDto {
  id: string
  isActive: boolean
}
