export interface JwtPayload {
  id: string
  roleId: string
  roleName: string
  isSuperAdmin: boolean
  platform: 'admin' | 'supplier' | 'buyer'
  iat?: number
  exp?: number
}
