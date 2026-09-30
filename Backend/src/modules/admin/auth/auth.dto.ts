import type { MenuNode } from '../rbac/rbac.helper'

export interface AdminRoleDto {
  id: string
  name: string
  label?: string | null
}

export interface UserDto {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  roleId: string
}

export interface LoginResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: string
  user: UserDto
  admin?: UserDto
  role: {
    id: string
    name: string
  }
  permissions: string[]
  menus: MenuNode[]
}

export interface RefreshTokenResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface AdminProfileDto {
  user: UserDto
  admin?: UserDto
  role: {
    id: string
    name: string
  }
  permissions: string[]
  menus: MenuNode[]
  lastLoginAt: Date | null
  createdAt: Date
}
