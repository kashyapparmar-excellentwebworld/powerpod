import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler.middleware'
import { StatusCode } from '@/constants/statusCodes'
import prisma from '@/core/prisma'

// Map raw permission keys to clear, human-readable module names
const PERMISSION_LABEL_MAP: Record<string, string> = {
  'settings.rbac': 'RBAC Roles & Permissions Management',
  'tickets.view': 'Support Tickets View',
  'tickets.manage': 'Support Tickets Management',
  'guidance.view': 'AI Guidance Knowledgebase',
  'guidance.manage': 'AI Guidance Document Management',
  'ai_settings.view': 'AI System Settings View',
  'ai_settings.manage': 'AI Configuration & Settings Management',
  'cms.view': 'CMS Content Pages View',
  'cms.manage': 'CMS Content Pages Management',
  'app_versions.view': 'App Versions View',
  'app_versions.manage': 'App Versions Management',
}

/**
 * Middleware that enforces RBAC module permissions with clear human-readable error feedback.
 */
export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication Required: Please sign in to access this feature.',
          StatusCode.UNAUTHORIZED,
        )
      }

      // Super admin has unrestricted system access
      if (req.user.roleName === 'super_admin' || req.user.isSuperAdmin) {
        return next()
      }

      // Check if user's role has permissionKey via raw SQL
      const rolePerms = (await prisma.$queryRawUnsafe(`
        SELECT rp.role_id FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id 
        WHERE rp.role_id = '${req.user.roleId}'::uuid
          AND p.permission_key = '${permissionKey}'
          AND p.status = 'ACTIVE'
        LIMIT 1;
      `).catch(() => [])) as any[]

      if (!rolePerms || rolePerms.length === 0) {
        const moduleLabel = PERMISSION_LABEL_MAP[permissionKey] || permissionKey
        throw new AppError(
          `Access Denied: You do not have permission to access '${moduleLabel}'. Required permission: '${permissionKey}'. Please contact your System Administrator if you require access.`,
          StatusCode.FORBIDDEN,
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
