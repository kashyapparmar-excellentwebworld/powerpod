import prisma from '@/core/prisma'
import crypto from 'crypto'

export interface RecordAuditLogInput {
  adminId?: string | null
  adminEmail?: string | null
  adminName?: string | null
  action: string
  module: string
  description: string
  ipAddress?: string | null
  userAgent?: string | null
  details?: Record<string, any> | null
}

export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  try {
    const id = crypto.randomUUID()
    const adminIdSql = input.adminId ? `'${input.adminId}'::uuid` : 'NULL'
    const adminEmailSql = input.adminEmail ? `'${input.adminEmail.replace(/'/g, "''")}'` : 'NULL'
    const adminNameSql = input.adminName ? `'${input.adminName.replace(/'/g, "''")}'` : 'NULL'
    const actionSql = `'${input.action.replace(/'/g, "''")}'`
    const moduleSql = `'${input.module.replace(/'/g, "''")}'`
    const descSql = `'${input.description.replace(/'/g, "''")}'`
    const ipSql = input.ipAddress ? `'${input.ipAddress}'` : 'NULL'
    const uaSql = input.userAgent ? `'${input.userAgent.replace(/'/g, "''")}'` : 'NULL'
    const detailsJson = input.details ? `'${JSON.stringify(input.details).replace(/'/g, "''")}'::jsonb` : 'NULL'

    await prisma.$executeRawUnsafe(`
      INSERT INTO audit_logs (id, admin_id, admin_email, admin_name, action, module, description, ip_address, user_agent, details, created_at)
      VALUES (
        '${id}'::uuid,
        ${adminIdSql},
        ${adminEmailSql},
        ${adminNameSql},
        ${actionSql},
        ${moduleSql},
        ${descSql},
        ${ipSql},
        ${uaSql},
        ${detailsJson},
        NOW()
      );
    `)
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}

export async function listAuditLogsService(query: {
  page?: number
  limit?: number
  adminId?: string
  module?: string
  action?: string
  search?: string
}) {
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = (page - 1) * limit

  const whereClauses: string[] = ['1=1']

  if (query.adminId) {
    whereClauses.push(`l.admin_id = '${query.adminId}'::uuid`)
  }
  if (query.module) {
    whereClauses.push(`l.module = '${query.module}'`)
  }
  if (query.action) {
    whereClauses.push(`l.action = '${query.action}'`)
  }
  if (query.search) {
    const s = query.search.replace(/'/g, "''")
    whereClauses.push(
      `(l.description ILIKE '%${s}%' OR l.admin_name ILIKE '%${s}%' OR l.admin_email ILIKE '%${s}%' OR l.action ILIKE '%${s}%')`,
    )
  }

  const whereSql = whereClauses.join(' AND ')

  const [logsResult, countResult] = (await Promise.all([
    prisma.$queryRawUnsafe(`
      SELECT l.*
      FROM audit_logs l
      WHERE ${whereSql}
      ORDER BY l.created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `),
    prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as total
      FROM audit_logs l
      WHERE ${whereSql};
    `),
  ])) as [any[], any[]]

  const total = countResult[0]?.total || 0

  return {
    data: logsResult.map((l) => ({
      id: l.id,
      adminId: l.admin_id,
      adminEmail: l.admin_email,
      adminName: l.admin_name,
      action: l.action,
      module: l.module,
      description: l.description,
      ipAddress: l.ip_address,
      userAgent: l.user_agent,
      details: l.details,
      createdAt: l.created_at,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAuditLogAdminsService() {
  const admins: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      l.admin_id as id,
      COALESCE(MAX(a.full_name), MAX(l.admin_name), MAX(l.admin_email), 'Admin User') as name,
      COALESCE(MAX(a.email), MAX(l.admin_email), '') as email
    FROM audit_logs l
    LEFT JOIN admins a ON l.admin_id = a.id
    WHERE l.admin_id IS NOT NULL
    GROUP BY l.admin_id
    ORDER BY name ASC;
  `)

  return admins.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
  }))
}
