import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * Seeder for Admin roles, 5 Managers, 5 Support Specialists, and Staff Skill assignments.
 */
export async function seedAdminUsers(prisma: PrismaClient) {
  console.log('👥 Seeding Roles, Managers, and Support Specialists...')

  // ── 1. Seed Roles ─────────────────────────────────────
  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: 'super_admin' },
    update: { label: 'Super Admin' },
    create: {
      name: 'super_admin',
      label: 'Super Admin',
      isSystem: true,
      isActive: true,
    },
  })

  await prisma.adminRole.upsert({
    where: { name: 'admin' },
    update: { label: 'Admin' },
    create: {
      name: 'admin',
      label: 'Admin',
      isSystem: true,
      isActive: true,
    },
  })

  const managerRole = await prisma.adminRole.upsert({
    where: { name: 'manager' },
    update: { label: 'Manager' },
    create: {
      name: 'manager',
      label: 'Manager',
      isSystem: false,
      isActive: true,
    },
  })

  const supportRole = await prisma.adminRole.upsert({
    where: { name: 'support' },
    update: { label: 'Support Specialist' },
    create: {
      name: 'support',
      label: 'Support Specialist',
      isSystem: false,
      isActive: true,
    },
  })

  console.log('✅ Roles seeded (super_admin, admin, manager, support)')

  // Hash shared default password for all seeded staff
  const passwordHash = await bcrypt.hash('Admin@1234', 12)

  // ── 2. Seed Super Admin User ──────────────────────────
  await prisma.admin.upsert({
    where: { email: 'wasla@yopmail.com' },
    update: { fullName: 'Chief Super Admin' },
    create: {
      fullName: 'Chief Super Admin',
      email: 'wasla@yopmail.com',
      passwordHash,
      roleId: superAdminRole.id,
      isActive: true,
    },
  })

  // ── 3. Seed 5 Managers ────────────────────────────────
  const managersData = [
    { fullName: 'James Wilson (Manager 1)', email: 'manager.1@company.com' },
    { fullName: 'Sarah Jenkins (Support Manager)', email: 'manager.2@company.com' },
    { fullName: 'Robert Vance (Operations Manager)', email: 'manager.3@company.com' },
    { fullName: 'Elena Rostova (Finance Manager)', email: 'manager.4@company.com' },
    { fullName: 'David Chen (Technical Manager)', email: 'manager.5@company.com' },
  ]

  const seededManagers = []
  for (const mData of managersData) {
    const manager = await prisma.admin.upsert({
      where: { email: mData.email },
      update: { fullName: mData.fullName },
      create: {
        fullName: mData.fullName,
        email: mData.email,
        passwordHash,
        roleId: managerRole.id,
        isActive: true,
      },
    })
    seededManagers.push(manager)
  }
  console.log('✅ 5 Manager users seeded successfully')

  // ── 4. Seed 5 Support Users / Specialists ─────────────
  const supportUsersData = [
    { fullName: 'Michael Scott (Support Agent 1)', email: 'support.1@company.com' },
    { fullName: 'Pam Beesly (Support Agent 2)', email: 'support.2@company.com' },
    { fullName: 'Jim Halpert (Support Agent 3)', email: 'support.3@company.com' },
    { fullName: 'Dwight Schrute (Support Agent 4)', email: 'support.4@company.com' },
    { fullName: 'Angela Martin (Finance 1)', email: 'support.5@company.com' },
  ]

  const seededSupportUsers = []
  for (const sData of supportUsersData) {
    const supportUser = await prisma.admin.upsert({
      where: { email: sData.email },
      update: { fullName: sData.fullName },
      create: {
        fullName: sData.fullName,
        email: sData.email,
        passwordHash,
        roleId: supportRole.id,
        isActive: true,
      },
    })
    seededSupportUsers.push(supportUser)
  }
  console.log('✅ 5 Support Specialist users seeded successfully')

  // ── 5. Seed Staff Skill & Department Links ────────────
  const depts = await prisma.supportDepartment.findMany()
  if (depts.length > 0) {
    const generalDept = depts.find((d) => d.code === 'general') || depts[0]
    const billingDept = depts.find((d) => d.code === 'billing') || depts[0]
    const techDept = depts.find((d) => d.code === 'technical') || depts[0]
    const opsDept = depts.find((d) => d.code === 'operations') || depts[0]

    const staffAssignments = [
      { adminId: seededSupportUsers[0].id, departmentId: generalDept.id, specialty: 'General Inquiries', level: 9 },
      { adminId: seededSupportUsers[1].id, departmentId: generalDept.id, specialty: 'Customer Care', level: 8 },
      { adminId: seededSupportUsers[2].id, departmentId: techDept.id, specialty: 'App Technical Support', level: 10 },
      { adminId: seededSupportUsers[3].id, departmentId: opsDept.id, specialty: 'Ride Safety & Operations', level: 9 },
      { adminId: seededSupportUsers[4].id, departmentId: billingDept.id, specialty: 'Payment Disputes & Refunds', level: 10 },
      { adminId: seededManagers[0].id, departmentId: generalDept.id, specialty: 'General Escalations', level: 10 },
      { adminId: seededManagers[1].id, departmentId: opsDept.id, specialty: 'Operational Escalations', level: 10 },
      { adminId: seededManagers[2].id, departmentId: opsDept.id, specialty: 'Field Safety Management', level: 10 },
      { adminId: seededManagers[3].id, departmentId: billingDept.id, specialty: 'Financial Audit & Refunds', level: 10 },
      { adminId: seededManagers[4].id, departmentId: techDept.id, specialty: 'Platform Architecture', level: 10 },
    ]

    for (const sa of staffAssignments) {
      const existingSkill = await prisma.staffSkill.findFirst({
        where: { adminId: sa.adminId, departmentId: sa.departmentId },
      })
      if (!existingSkill) {
        await prisma.staffSkill.create({
          data: {
            adminId: sa.adminId,
            departmentId: sa.departmentId,
            specialty: sa.specialty,
            experienceLevel: sa.level,
            isAvailable: true,
          },
        })
      }
    }
    console.log('✅ Staff skills and department assignments seeded successfully')
  }
}