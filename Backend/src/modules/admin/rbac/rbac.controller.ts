import { Request, Response, NextFunction } from 'express'
import * as rbacService from './rbac.service'
import { StatusCode } from '@/constants/statusCodes'
import { recordAuditLog } from '../auditLog/auditLog.service'

const getId = (req: Request): string => (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || '')

// Helper to log user details from Express request
const auditUser = (req: Request) => {
  const user = req.user as any
  return {
    adminId: user?.id,
    adminEmail: user?.email,
    adminName: user?.fullName || user?.email,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  }
}

// =============================================================================
// MODULES CONTROLLER
// =============================================================================

export async function getModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await rbacService.listModulesService()
    res.status(StatusCode.OK).json({ success: true, data: modules })
  } catch (error) {
    next(error)
  }
}

export async function createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const module = await rbacService.createModuleService(req.body)
    recordAuditLog({
      ...auditUser(req),
      action: 'CREATE_MODULE',
      module: 'RBAC_MODULES',
      description: `Created module '${module.name}' (${module.slug})`,
      details: req.body,
    })
    res.status(StatusCode.CREATED).json({ success: true, data: module, message: 'Module created successfully' })
  } catch (error) {
    next(error)
  }
}

export async function updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    const module = await rbacService.updateModuleService(id, req.body)
    recordAuditLog({
      ...auditUser(req),
      action: 'UPDATE_MODULE',
      module: 'RBAC_MODULES',
      description: `Updated module '${module?.name || id}'`,
      details: req.body,
    })
    res.status(StatusCode.OK).json({ success: true, data: module, message: 'Module updated successfully' })
  } catch (error) {
    next(error)
  }
}

export async function deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    await rbacService.deleteModuleService(id)
    recordAuditLog({
      ...auditUser(req),
      action: 'DELETE_MODULE',
      module: 'RBAC_MODULES',
      description: `Deleted module ID '${id}'`,
    })
    res.status(StatusCode.OK).json({ success: true, message: 'Module deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// =============================================================================
// PERMISSIONS CONTROLLER
// =============================================================================

export async function getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permissions = await rbacService.listPermissionsService()
    res.status(StatusCode.OK).json({ success: true, data: permissions })
  } catch (error) {
    next(error)
  }
}

export async function createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permission = await rbacService.createPermissionService(req.body)
    recordAuditLog({
      ...auditUser(req),
      action: 'CREATE_PERMISSION',
      module: 'RBAC_PERMISSIONS',
      description: `Created permission '${permission.permissionKey}'`,
      details: req.body,
    })
    res.status(StatusCode.CREATED).json({ success: true, data: permission, message: 'Permission created successfully' })
  } catch (error) {
    next(error)
  }
}

export async function autoGeneratePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { moduleId, actions } = req.body
    const created = await rbacService.autoGenerateModulePermissionsService(moduleId, actions || ['view', 'create', 'edit', 'delete', 'export'])
    recordAuditLog({
      ...auditUser(req),
      action: 'AUTO_GENERATE_PERMISSIONS',
      module: 'RBAC_PERMISSIONS',
      description: `Auto-generated ${created.length} action permissions for module '${moduleId}'`,
      details: { moduleId, actions },
    })
    res.status(StatusCode.OK).json({ success: true, data: created, message: `Generated ${created.length} permissions` })
  } catch (error) {
    next(error)
  }
}

export async function deletePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    await rbacService.deletePermissionService(id)
    recordAuditLog({
      ...auditUser(req),
      action: 'DELETE_PERMISSION',
      module: 'RBAC_PERMISSIONS',
      description: `Deleted permission ID '${id}'`,
    })
    res.status(StatusCode.OK).json({ success: true, message: 'Permission deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// =============================================================================
// ROLES CONTROLLER
// =============================================================================

export async function getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await rbacService.listRolesService()
    res.status(StatusCode.OK).json({ success: true, data: roles })
  } catch (error) {
    next(error)
  }
}

export async function getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await rbacService.getRoleByIdService(getId(req))
    res.status(StatusCode.OK).json({ success: true, data: role })
  } catch (error) {
    next(error)
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await rbacService.createRoleService(req.body)
    recordAuditLog({
      ...auditUser(req),
      action: 'CREATE_ROLE',
      module: 'RBAC_ROLES',
      description: `Created role '${role.label || role.name}'`,
      details: req.body,
    })
    res.status(StatusCode.CREATED).json({ success: true, data: role, message: 'Role created successfully' })
  } catch (error) {
    next(error)
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    const role = await rbacService.updateRoleService(id, req.body)
    recordAuditLog({
      ...auditUser(req),
      action: 'UPDATE_ROLE',
      module: 'RBAC_ROLES',
      description: `Updated role '${role.label || role.name}'`,
      details: req.body,
    })
    res.status(StatusCode.OK).json({ success: true, data: role, message: 'Role updated successfully' })
  } catch (error) {
    next(error)
  }
}

export async function assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    const { permissionIds } = req.body
    const updatedRole = await rbacService.assignRolePermissionsService(id, permissionIds || [])
    recordAuditLog({
      ...auditUser(req),
      action: 'ASSIGN_PERMISSIONS',
      module: 'RBAC_ROLES',
      description: `Updated permissions matrix for role '${updatedRole.label || updatedRole.name}' (${(permissionIds || []).length} assigned)`,
      details: { roleId: id, permissionCount: (permissionIds || []).length },
    })
    res.status(StatusCode.OK).json({ success: true, data: updatedRole, message: 'Role permissions saved successfully' })
  } catch (error) {
    next(error)
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getId(req)
    await rbacService.deleteRoleService(id)
    recordAuditLog({
      ...auditUser(req),
      action: 'DELETE_ROLE',
      module: 'RBAC_ROLES',
      description: `Deleted role ID '${id}'`,
    })
    res.status(StatusCode.OK).json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    next(error)
  }
}
