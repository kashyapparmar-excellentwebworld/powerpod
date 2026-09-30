import prisma from '@/core/prisma'
import { AppError } from '@/middlewares/errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'
import crypto from 'crypto'

// =============================================================================
// MODULES SERVICE
// =============================================================================

export async function listModulesService() {
  try {
    const modules: any[] = await prisma.$queryRawUnsafe(`
      SELECT m.*, 
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', p.id,
                'moduleId', p.module_id,
                'name', p.name,
                'action', p.action,
                'permissionKey', p.permission_key,
                'status', p.status
              )
            ) FROM permissions p WHERE p.module_id = m.id
          ), '[]'::json
        ) as permissions
      FROM modules m
      ORDER BY m.sort_order ASC;
    `)

    return modules.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      icon: m.icon,
      route: m.route,
      parentId: m.parent_id,
      sortOrder: m.sort_order,
      status: m.status,
      permissions: m.permissions || [],
    }))
  } catch (error) {
    return []
  }
}

export async function createModuleService(data: {
  name: string
  slug: string
  icon?: string
  route?: string
  parentId?: string
  sortOrder?: number
}) {
  const existing: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM modules WHERE slug = '${data.slug}' LIMIT 1;`,
  )
  if (existing && existing.length > 0) {
    throw new AppError(`Module with slug '${data.slug}' already exists.`, StatusCode.BAD_REQUEST)
  }

  const id = crypto.randomUUID()
  await prisma.$executeRawUnsafe(`
    INSERT INTO modules (id, name, slug, icon, route, parent_id, sort_order, status, created_at, updated_at)
    VALUES ('${id}'::uuid, '${data.name}', '${data.slug}', ${data.icon ? `'${data.icon}'` : 'NULL'}, ${data.route ? `'${data.route}'` : 'NULL'}, ${data.parentId ? `'${data.parentId}'::uuid` : 'NULL'}, ${data.sortOrder ?? 0}, 'ACTIVE', NOW(), NOW());
  `)

  return { id, ...data, status: 'ACTIVE' }
}

export async function updateModuleService(
  id: string,
  data: {
    name?: string
    slug?: string
    icon?: string
    route?: string
    parentId?: string
    sortOrder?: number
    status?: string
  },
) {
  if (data.slug) {
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM modules WHERE slug = '${data.slug}' AND id != '${id}'::uuid LIMIT 1;`,
    )
    if (existing && existing.length > 0) {
      throw new AppError(`Module with slug '${data.slug}' already exists.`, StatusCode.BAD_REQUEST)
    }
  }

  const updates: string[] = []
  if (data.name !== undefined) updates.push(`name = '${data.name}'`)
  if (data.slug !== undefined) updates.push(`slug = '${data.slug}'`)
  if (data.icon !== undefined) updates.push(`icon = ${data.icon ? `'${data.icon}'` : 'NULL'}`)
  if (data.route !== undefined) updates.push(`route = ${data.route ? `'${data.route}'` : 'NULL'}`)
  if (data.parentId !== undefined)
    updates.push(`parent_id = ${data.parentId ? `'${data.parentId}'::uuid` : 'NULL'}`)
  if (data.sortOrder !== undefined) updates.push(`sort_order = ${data.sortOrder}`)
  if (data.status !== undefined) updates.push(`status = '${data.status}'`)
  updates.push(`updated_at = NOW()`)

  if (updates.length > 0) {
    await prisma.$executeRawUnsafe(
      `UPDATE modules SET ${updates.join(', ')} WHERE id = '${id}'::uuid;`,
    )
  }

  const res: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM modules WHERE id = '${id}'::uuid LIMIT 1;`,
  )
  return res[0]
}

export async function deleteModuleService(id: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM modules WHERE id = '${id}'::uuid;`)
}

// =============================================================================
// PERMISSIONS SERVICE
// =============================================================================

export async function listPermissionsService() {
  const permissions: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.*, m.name as module_name, m.slug as module_slug
    FROM permissions p
    LEFT JOIN modules m ON p.module_id = m.id
    ORDER BY p.created_at DESC;
  `)

  const grouped: Record<string, any> = {}

  permissions.forEach((p) => {
    const moduleName = p.module_name || 'Unassigned'
    if (!grouped[moduleName]) {
      grouped[moduleName] = {
        moduleId: p.module_id,
        moduleName,
        moduleSlug: p.module_slug,
        permissions: [],
      }
    }
    grouped[moduleName].permissions.push({
      id: p.id,
      moduleId: p.module_id,
      name: p.name,
      action: p.action,
      permissionKey: p.permission_key,
      description: p.description,
      status: p.status,
      module: { id: p.module_id, name: p.module_name, slug: p.module_slug },
    })
  })

  const raw = permissions.map((p) => ({
    id: p.id,
    moduleId: p.module_id,
    name: p.name,
    action: p.action,
    permissionKey: p.permission_key,
    description: p.description,
    status: p.status,
    module: { id: p.module_id, name: p.module_name, slug: p.module_slug },
  }))

  return {
    raw,
    grouped: Object.values(grouped),
  }
}

export async function createPermissionService(data: {
  moduleId: string
  name: string
  action: string
  permissionKey: string
  description?: string
}) {
  const existing: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM permissions WHERE permission_key = '${data.permissionKey}' LIMIT 1;`,
  )
  if (existing && existing.length > 0) {
    throw new AppError(
      `Permission key '${data.permissionKey}' already exists.`,
      StatusCode.BAD_REQUEST,
    )
  }

  const id = crypto.randomUUID()
  await prisma.$executeRawUnsafe(`
    INSERT INTO permissions (id, module_id, name, action, permission_key, description, status, created_at, updated_at)
    VALUES ('${id}'::uuid, '${data.moduleId}'::uuid, '${data.name}', '${data.action.toLowerCase()}', '${data.permissionKey}', ${data.description ? `'${data.description}'` : 'NULL'}, 'ACTIVE', NOW(), NOW());
  `)

  return { id, ...data, status: 'ACTIVE' }
}

export async function autoGenerateModulePermissionsService(moduleId: string, actions: string[]) {
  const modules: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM modules WHERE id = '${moduleId}'::uuid LIMIT 1;`,
  )
  if (!modules || modules.length === 0) throw new AppError('Module not found', StatusCode.NOT_FOUND)

  const mod = modules[0]
  const createdPermissions = []

  for (const action of actions) {
    const cleanAction = action.toLowerCase().trim()
    const permissionKey = `${mod.slug}.${cleanAction}`
    const permissionName = `${cleanAction.charAt(0).toUpperCase() + cleanAction.slice(1)} ${mod.name}`

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM permissions WHERE permission_key = '${permissionKey}' LIMIT 1;`,
    )
    if (!existing || existing.length === 0) {
      const id = crypto.randomUUID()
      await prisma.$executeRawUnsafe(`
        INSERT INTO permissions (id, module_id, name, action, permission_key, status, created_at, updated_at)
        VALUES ('${id}'::uuid, '${mod.id}'::uuid, '${permissionName}', '${cleanAction}', '${permissionKey}', 'ACTIVE', NOW(), NOW());
      `)
      createdPermissions.push({
        id,
        moduleId: mod.id,
        name: permissionName,
        action: cleanAction,
        permissionKey,
      })
    }
  }

  return createdPermissions
}

export async function deletePermissionService(id: string) {
  await prisma.$executeRawUnsafe(`DELETE FROM permissions WHERE id = '${id}'::uuid;`)
}

// =============================================================================
// ROLES & ROLE PERMISSIONS SERVICE
// =============================================================================

export async function listRolesService() {
  const roles: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      r.*,
      COUNT(DISTINCT a.id)::int as user_count,
      COUNT(DISTINCT rp.permission_id)::int as permission_count,
      COALESCE(
        json_agg(DISTINCT rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL), '[]'::json
      ) as permission_ids
    FROM admin_roles r
    LEFT JOIN admins a ON a.role_id = r.id AND a.deleted_at IS NULL
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    WHERE r.deleted_at IS NULL
    GROUP BY r.id
    ORDER BY r.created_at ASC;
  `)

  return roles.map((r) => ({
    id: r.id,
    name: r.name,
    label: r.label || r.name,
    description: r.description,
    isSystem: r.is_system,
    isActive: r.is_active,
    userCount: r.user_count || 0,
    permissionCount: r.permission_count || 0,
    permissionIds: r.permission_ids || [],
    createdAt: r.created_at,
  }))
}

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export async function getRoleByIdService(id: string) {
  if (!isUuid(id)) {
    throw new AppError('Invalid Role ID format', StatusCode.BAD_REQUEST)
  }
  const roles: any[] = await prisma.$queryRawUnsafe(`
    SELECT r.* FROM admin_roles r WHERE r.id = '${id}'::uuid AND r.deleted_at IS NULL LIMIT 1;
  `)
  if (!roles || roles.length === 0) {
    throw new AppError('Role not found', StatusCode.NOT_FOUND)
  }
  const role = roles[0]

  const permissions: any[] = await prisma.$queryRawUnsafe(`
    SELECT p.*, m.name as module_name, m.slug as module_slug
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    LEFT JOIN modules m ON p.module_id = m.id
    WHERE rp.role_id = '${id}'::uuid;
  `)

  return {
    id: role.id,
    name: role.name,
    label: role.label || role.name,
    description: role.description,
    isSystem: role.is_system,
    isActive: role.is_active,
    permissions: permissions.map((p) => ({
      id: p.id,
      moduleId: p.module_id,
      name: p.name,
      action: p.action,
      permissionKey: p.permission_key,
      status: p.status,
      module: { id: p.module_id, name: p.module_name, slug: p.module_slug },
    })),
    permissionIds: permissions.map((p) => p.id),
  }
}

export async function createRoleService(data: { name: string; description?: string }) {
  const nameSlug = data.name.toLowerCase().replace(/\s+/g, '_')
  const existing: any[] = await prisma.$queryRawUnsafe(
    `SELECT id FROM admin_roles WHERE name = '${nameSlug}' AND deleted_at IS NULL LIMIT 1;`,
  )
  if (existing && existing.length > 0) {
    throw new AppError(`Role '${data.name}' already exists.`, StatusCode.BAD_REQUEST)
  }

  const id = crypto.randomUUID()
  await prisma.$executeRawUnsafe(`
    INSERT INTO admin_roles (id, name, label, description, is_system, is_active, created_at, updated_at)
    VALUES ('${id}'::uuid, '${nameSlug}', '${data.name}', ${data.description ? `'${data.description}'` : 'NULL'}, false, true, NOW(), NOW());
  `)

  return {
    id,
    name: nameSlug,
    label: data.name,
    description: data.description,
    isSystem: false,
    isActive: true,
  }
}

export async function updateRoleService(
  id: string,
  data: { name?: string; description?: string; isActive?: boolean },
) {
  const updates: string[] = []
  if (data.name !== undefined) updates.push(`label = '${data.name}'`)
  if (data.description !== undefined)
    updates.push(`description = ${data.description ? `'${data.description}'` : 'NULL'}`)
  if (data.isActive !== undefined) updates.push(`is_active = ${data.isActive}`)
  updates.push(`updated_at = NOW()`)

  if (updates.length > 0) {
    await prisma.$executeRawUnsafe(
      `UPDATE admin_roles SET ${updates.join(', ')} WHERE id = '${id}'::uuid;`,
    )
  }

  return getRoleByIdService(id)
}

export async function assignRolePermissionsService(roleId: string, permissionIds: string[]) {
  // Clear existing
  await prisma.$executeRawUnsafe(`DELETE FROM role_permissions WHERE role_id = '${roleId}'::uuid;`)

  // Insert new
  for (const pId of permissionIds) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ('${roleId}'::uuid, '${pId}'::uuid)
      ON CONFLICT DO NOTHING;
    `)
  }

  return getRoleByIdService(roleId)
}

export async function deleteRoleService(id: string) {
  const roles: any[] = await prisma.$queryRawUnsafe(
    `SELECT is_system FROM admin_roles WHERE id = '${id}'::uuid LIMIT 1;`,
  )
  if (!roles || roles.length === 0) throw new AppError('Role not found', StatusCode.NOT_FOUND)
  if (roles[0].is_system) {
    throw new AppError('System roles cannot be deleted', StatusCode.BAD_REQUEST)
  }

  await prisma.$executeRawUnsafe(
    `UPDATE admin_roles SET deleted_at = NOW(), is_active = false WHERE id = '${id}'::uuid;`,
  )
}
