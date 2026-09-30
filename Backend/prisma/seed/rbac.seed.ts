import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export async function seedRbac(prisma: PrismaClient) {
  console.log('🌱 Seeding RBAC Modules, Permissions, and Roles via direct SQL...')

  // 1. Create Default Modules
  const modulesData = [
    { name: 'Dashboard', slug: 'dashboard', icon: 'LayoutDashboard', route: '/dashboard', sortOrder: 1 },
    { name: 'Buyers', slug: 'buyers', icon: 'Users', route: '/buyers', sortOrder: 2 },
    { name: 'Suppliers', slug: 'suppliers', icon: 'Briefcase', route: '/suppliers', sortOrder: 3 },
    { name: 'CMS', slug: 'cms', icon: 'FileText', route: '/cms', sortOrder: 4 },
    { name: 'App Version', slug: 'app-versions', icon: 'Smartphone', route: '/app-versions', sortOrder: 5 },
    { name: 'Products', slug: 'products', icon: 'ShoppingCart', route: '/products', sortOrder: 6 },
    { name: 'Orders', slug: 'orders', icon: 'ShoppingBag', route: '/orders', sortOrder: 7 },
    { name: 'Settings', slug: 'settings', icon: 'Settings', route: '/settings', sortOrder: 8 },
  ]

  const modulesMap: Record<string, string> = {}

  for (const m of modulesData) {
    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO "modules" ("id", "name", "slug", "icon", "route", "sort_order", "status", "created_at", "updated_at")
      VALUES ('${id}'::uuid, '${m.name}', '${m.slug}', '${m.icon}', '${m.route}', ${m.sortOrder}, 'ACTIVE', NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE SET "name" = '${m.name}', "icon" = '${m.icon}', "route" = '${m.route}', "sort_order" = ${m.sortOrder};
    `)

    const fetched: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "modules" WHERE "slug" = '${m.slug}';`)
    if (fetched && fetched[0]) {
      modulesMap[m.slug] = fetched[0].id
    }
  }

  // 2. Create Permissions
  const permissionsData = [
    // Dashboard
    { moduleSlug: 'dashboard', action: 'view', key: 'dashboard.view', name: 'View Dashboard' },

    // Buyers
    { moduleSlug: 'buyers', action: 'view', key: 'buyers.view', name: 'View Buyers' },
    { moduleSlug: 'buyers', action: 'create', key: 'buyers.create', name: 'Create Buyer' },
    { moduleSlug: 'buyers', action: 'edit', key: 'buyers.edit', name: 'Edit Buyer' },
    { moduleSlug: 'buyers', action: 'delete', key: 'buyers.delete', name: 'Delete Buyer' },

    // Suppliers
    { moduleSlug: 'suppliers', action: 'view', key: 'suppliers.view', name: 'View Suppliers' },
    { moduleSlug: 'suppliers', action: 'create', key: 'suppliers.create', name: 'Create Supplier' },
    { moduleSlug: 'suppliers', action: 'edit', key: 'suppliers.edit', name: 'Edit Supplier' },
    { moduleSlug: 'suppliers', action: 'delete', key: 'suppliers.delete', name: 'Delete Supplier' },

    // CMS
    { moduleSlug: 'cms', action: 'view', key: 'cms.view', name: 'View CMS Pages' },
    { moduleSlug: 'cms', action: 'create', key: 'cms.create', name: 'Create CMS Page' },
    { moduleSlug: 'cms', action: 'edit', key: 'cms.edit', name: 'Edit CMS Page' },
    { moduleSlug: 'cms', action: 'delete', key: 'cms.delete', name: 'Delete CMS Page' },
    { moduleSlug: 'cms', action: 'publish', key: 'cms.publish', name: 'Publish CMS Page' },

    // App Version
    { moduleSlug: 'app-versions', action: 'view', key: 'app-versions.view', name: 'View App Versions' },
    { moduleSlug: 'app-versions', action: 'create', key: 'app-versions.create', name: 'Create Release' },
    { moduleSlug: 'app-versions', action: 'edit', key: 'app-versions.edit', name: 'Edit Release' },
    { moduleSlug: 'app-versions', action: 'delete', key: 'app-versions.delete', name: 'Delete Release' },
    { moduleSlug: 'app-versions', action: 'force_update', key: 'app-versions.force_update', name: 'Toggle Force Update' },

    // Products
    { moduleSlug: 'products', action: 'view', key: 'products.view', name: 'View Products' },
    { moduleSlug: 'products', action: 'create', key: 'products.create', name: 'Create Product' },
    { moduleSlug: 'products', action: 'edit', key: 'products.edit', name: 'Edit Product' },
    { moduleSlug: 'products', action: 'delete', key: 'products.delete', name: 'Delete Product' },
    { moduleSlug: 'products', action: 'export', key: 'products.export', name: 'Export Products' },

    // Orders
    { moduleSlug: 'orders', action: 'view', key: 'orders.view', name: 'View Orders' },
    { moduleSlug: 'orders', action: 'create', key: 'orders.create', name: 'Create Order' },
    { moduleSlug: 'orders', action: 'edit', key: 'orders.edit', name: 'Edit Order' },
    { moduleSlug: 'orders', action: 'refund', key: 'orders.refund', name: 'Refund Order' },

    // Settings
    { moduleSlug: 'settings', action: 'view', key: 'settings.view', name: 'View Settings' },
    { moduleSlug: 'settings', action: 'edit', key: 'settings.edit', name: 'Edit Settings' },
    { moduleSlug: 'settings', action: 'rbac', key: 'settings.rbac', name: 'Manage RBAC & Roles' },
  ]

  const allPermIds: string[] = []

  for (const p of permissionsData) {
    const moduleId = modulesMap[p.moduleSlug]
    if (!moduleId) continue

    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO "permissions" ("id", "module_id", "name", "action", "permission_key", "status", "created_at", "updated_at")
      VALUES ('${id}'::uuid, '${moduleId}'::uuid, '${p.name}', '${p.action}', '${p.key}', 'ACTIVE', NOW(), NOW())
      ON CONFLICT ("permission_key") DO UPDATE SET "name" = '${p.name}', "action" = '${p.action}', "module_id" = '${moduleId}'::uuid;
    `)

    const fetched: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "permissions" WHERE "permission_key" = '${p.key}';`)
    if (fetched && fetched[0]) {
      allPermIds.push(fetched[0].id)
    }
  }

  // 3. Seed Roles
  const rolesData = [
    { name: 'super_admin', label: 'Super Admin', desc: 'Full system access to all modules and permissions.', isSystem: true },
    { name: 'admin', label: 'Admin', desc: 'Standard administrator with full access to main features.', isSystem: false },
    { name: 'manager', label: 'Manager', desc: 'Operational manager with view and edit permissions.', isSystem: false },
    { name: 'support', label: 'Support', desc: 'Customer support role with view-only permissions.', isSystem: false },
  ]

  const rolesMap: Record<string, string> = {}

  for (const r of rolesData) {
    const id = crypto.randomUUID()
    await prisma.$executeRawUnsafe(`
      INSERT INTO "admin_roles" ("id", "name", "label", "description", "is_system", "is_active", "created_at", "updated_at")
      VALUES ('${id}'::uuid, '${r.name}', '${r.label}', '${r.desc}', ${r.isSystem}, true, NOW(), NOW())
      ON CONFLICT ("name") DO UPDATE SET "label" = '${r.label}', "description" = '${r.desc}', "is_system" = ${r.isSystem};
    `)

    const fetched: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "admin_roles" WHERE "name" = '${r.name}';`)
    if (fetched && fetched[0]) {
      rolesMap[r.name] = fetched[0].id
    }
  }

  // 4. Assign ALL permissions to Super Admin and Admin roles
  const superAdminRoleId = rolesMap['super_admin']
  const adminRoleId = rolesMap['admin']

  for (const permId of allPermIds) {
    if (superAdminRoleId) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        VALUES ('${superAdminRoleId}'::uuid, '${permId}'::uuid)
        ON CONFLICT DO NOTHING;
      `)
    }
    if (adminRoleId) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        VALUES ('${adminRoleId}'::uuid, '${permId}'::uuid)
        ON CONFLICT DO NOTHING;
      `)
    }
  }

  console.log('✅ RBAC Modules, Permissions, and Roles seeded via direct SQL successfully!')
}
