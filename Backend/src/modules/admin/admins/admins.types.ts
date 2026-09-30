export interface AdminWithRole {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  role: {
    id: string
    name: string
    label: string | null
  }
}

export interface ListAdminsQuery {
  page?: number
  limit?: number
  search?: string
  roleId?: string
  isActive?: boolean
}
