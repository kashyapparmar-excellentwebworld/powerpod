import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { seedAdminUsers } from './seed/admin-users.seed'
import { seedCmsPages } from './seed/cms.seed'
import { seedAppVersions } from './seed/version.seed'
import { seedRbac } from './seed/rbac.seed'
import { seedSupportDepartments } from './seed/support-departments.seed'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const seedFunctions = {
  'rbac': seedRbac,
  'admin-users': seedAdminUsers,
  'cms-pages': seedCmsPages,
  'app-versions': seedAppVersions,
  'support-departments': seedSupportDepartments,
}

const args = process.argv.slice(2)
const targetSeed = args[0]

async function main() {
  console.log('🚀 Starting database seeding...')

  if (targetSeed) {
    const fn = seedFunctions[targetSeed as keyof typeof seedFunctions]
    if (!fn) {
      console.error(`❌ Unknown seed: ${targetSeed}`)
      console.log('Available seeds:', Object.keys(seedFunctions).join(', '))
      process.exit(1)
    }
    console.log(`🎯 Running seed: ${targetSeed}`)
    await fn(prisma)
    console.log(`✅ ${targetSeed} completed`)
  } else {
    console.log('🌱 Running all seeds...')
    await seedRbac(prisma)
    await seedAdminUsers(prisma)
    await seedCmsPages(prisma)
    await seedAppVersions(prisma)
    await seedSupportDepartments(prisma)
    console.log('🎉 All seeds completed!')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
