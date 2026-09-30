import api from './axiosInstance'

export interface ModuleItem {
  id: string
  name: string
  slug: string
  icon: string | null
  route: string | null
  parentId: string | null
  sortOrder: number
  status: string
  children?: ModuleItem[]
  permissions?: PermissionItem[]
}

export interface PermissionItem {
  id: string
  moduleId: string
  name: string
  action: string
  permissionKey: string
  description: string | null
  status: string
  module?: {
    id: string
    name: string
    slug: string
  }
}

export interface GroupedPermission {
  moduleId: string
  moduleName: string
  moduleSlug: string
  permissions: PermissionItem[]
}

export interface RoleItem {
  id: string
  name: string
  label: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  userCount: number
  permissionCount: number
  permissionIds: string[]
  permissions?: PermissionItem[]
}

export const rbacApi = {
  // Modules
  getModules: async () => {
    const res = await api.get('/rbac/modules')
    return res.data
  },
  createModule: async (data: Partial<ModuleItem>) => {
    const res = await api.post('/rbac/modules', data)
    return res.data
  },
  updateModule: async (id: string, data: Partial<ModuleItem>) => {
    const res = await api.put(`/rbac/modules/${id}`, data)
    return res.data
  },
  deleteModule: async (id: string) => {
    const res = await api.delete(`/rbac/modules/${id}`)
    return res.data
  },

  // Permissions
  getPermissions: async () => {
    const res = await api.get('/rbac/permissions')
    return res.data
  },
  createPermission: async (data: Partial<PermissionItem>) => {
    const res = await api.post('/rbac/permissions', data)
    return res.data
  },
  autoGeneratePermissions: async (moduleId: string, actions: string[]) => {
    const res = await api.post('/rbac/permissions/auto-generate', { moduleId, actions })
    return res.data
  },
  deletePermission: async (id: string) => {
    const res = await api.delete(`/rbac/permissions/${id}`)
    return res.data
  },

  // Roles
  getRoles: async () => {
    const res = await api.get('/rbac/roles')
    return res.data
  },
  getRoleById: async (id: string) => {
    const res = await api.get(`/rbac/roles/${id}`)
    return res.data
  },
  createRole: async (data: { name: string; description?: string }) => {
    const res = await api.post('/rbac/roles', data)
    return res.data
  },
  updateRole: async (id: string, data: { name?: string; description?: string; isActive?: boolean }) => {
    const res = await api.put(`/rbac/roles/${id}`, data)
    return res.data
  },
  assignPermissions: async (roleId: string, permissionIds: string[]) => {
    const res = await api.post(`/rbac/roles/${roleId}/permissions`, { permissionIds })
    return res.data
  },
  deleteRole: async (id: string) => {
    const res = await api.delete(`/rbac/roles/${id}`)
    return res.data
  },
}
