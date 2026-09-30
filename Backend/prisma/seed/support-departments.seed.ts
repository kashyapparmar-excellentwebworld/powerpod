import { PrismaClient } from '@prisma/client'

export async function seedSupportDepartments(prisma: PrismaClient) {
  console.log('🎧 Seeding Support Departments...')

  const departments = [
    {
      name: 'General Support',
      code: 'general',
      description: 'General customer and driver support inquiries',
    },
    {
      name: 'Billing & Refunds',
      code: 'billing',
      description: 'Payment disputes, fare calculations, and refund processing',
    },
    {
      name: 'Technical & Account',
      code: 'technical',
      description: 'App login, account verification, and technical bugs',
    },
    {
      name: 'Operations & Safety',
      code: 'operations',
      description: 'Emergency assistance, ride safety, and operational issues',
    },
  ]

  for (const dept of departments) {
    await prisma.supportDepartment.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
  }

  console.log('✅ Support Departments seeded successfully!')
}
