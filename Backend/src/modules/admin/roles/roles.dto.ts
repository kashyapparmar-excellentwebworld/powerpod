export interface AdminRoleDto {
  id: string
  name: string
  label: string | null
}

export interface AdminRoleListDto {
  roles: AdminRoleDto[]
}
