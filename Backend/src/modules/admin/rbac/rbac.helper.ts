import prisma from '@/core/prisma'

export interface MenuNode {
  id: string
  name: string
  slug: string
  route: string | null
  icon: string | null
  sortOrder: number
  parentId: string | null
  children?: MenuNode[]
}

export async function getPermissionsAndMenusForRole(roleId: string, isSuperAdmin: boolean) {
  let permissionsKeys: string[] = []
  let allowedModuleIds: Set<string> = new Set()

  try {
    const permModel = (prisma as any).permission
    const moduleModel = (prisma as any).module
    const rolePermModel = (prisma as any).rolePermission

    if (isSuperAdmin) {
      if (permModel && moduleModel) {
        const [allPerms, allModules] = await Promise.all([
          permModel.findMany({
            where: { status: 'ACTIVE' },
            select: { permissionKey: true },
          }),
          moduleModel.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
          }),
        ])

        permissionsKeys = (allPerms || []).map((p: any) => p.permissionKey).filter(Boolean)
        allowedModuleIds = new Set((allModules || []).map((m: any) => m.id).filter(Boolean))
      }
    } else {
      if (rolePermModel) {
        const rolePerms = await rolePermModel.findMany({
          where: {
            roleId,
            permission: { status: 'ACTIVE' },
          },
          include: {
            permission: true,
          },
        })

        permissionsKeys = (rolePerms || [])
          .map((rp: any) => rp.permission?.permissionKey)
          .filter(Boolean)
        allowedModuleIds = new Set(
          (rolePerms || []).map((rp: any) => rp.permission?.moduleId).filter(Boolean),
        )
      }
    }

    let modules: any[] = []
    if (moduleModel && allowedModuleIds.size > 0) {
      modules = await moduleModel.findMany({
        where: {
          id: { in: Array.from(allowedModuleIds) },
          status: 'ACTIVE',
        },
        orderBy: { sortOrder: 'asc' },
      })
    }

    // Build menu tree
    const menuMap = new Map<string, MenuNode>()
    const rootMenus: MenuNode[] = []

    modules.forEach((mod: any) => {
      menuMap.set(mod.id, {
        id: mod.id,
        name: mod.name,
        slug: mod.slug,
        route: mod.route,
        icon: mod.icon,
        sortOrder: mod.sortOrder,
        parentId: mod.parentId,
        children: [],
      })
    })

    menuMap.forEach((node) => {
      if (node.parentId && menuMap.has(node.parentId)) {
        menuMap.get(node.parentId)!.children!.push(node)
      } else {
        rootMenus.push(node)
      }
    })

    return {
      permissions: permissionsKeys.length > 0 ? permissionsKeys : ['*'],
      menus: rootMenus,
    }
  } catch (error) {
    console.warn('RBAC helper lookup warning:', error)
    return {
      permissions: ['*'],
      menus: [],
    }
  }
}
