import prisma from '@/core/prisma'
import type { AdminRoleListDto } from './roles.dto'

export async function getRolesDropdownService(): Promise<AdminRoleListDto> {
  const roles = await prisma.adminRole.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true, label: true },
    orderBy: { label: 'asc' },
  })
  return { roles }
}
