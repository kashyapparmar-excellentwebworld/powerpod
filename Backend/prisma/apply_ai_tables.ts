import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { seedAdminUsers } from './seed/admin-users.seed'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Ensuring AI & Support Ticket tables exist in PostgreSQL...')

  await prisma.$executeRawUnsafe(`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS "ai_config" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
      "gemini_api_key" TEXT,
      "confidence_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
      "updated_by" UUID,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ai_config_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "guidance_documents" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "title" VARCHAR(255) NOT NULL,
      "file_name" VARCHAR(255) NOT NULL,
      "file_type" VARCHAR(50) NOT NULL,
      "file_size" INTEGER NOT NULL DEFAULT 0,
      "status" VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
      "uploaded_by" UUID,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "guidance_documents_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE IF NOT EXISTS "guidance_chunks" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "document_id" UUID NOT NULL,
      "chunk_index" INTEGER NOT NULL,
      "content" TEXT NOT NULL,
      "vector_embedding" JSONB,
      "token_count" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "guidance_chunks_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "guidance_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "guidance_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "support_departments" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "name" VARCHAR(100) NOT NULL,
      "code" VARCHAR(50) NOT NULL,
      "description" TEXT,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "support_departments_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "support_departments_code_key" UNIQUE ("code")
    );

    CREATE TABLE IF NOT EXISTS "staff_skills" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "admin_id" UUID NOT NULL,
      "department_id" UUID NOT NULL,
      "specialty" VARCHAR(100) NOT NULL,
      "experience_level" INTEGER NOT NULL DEFAULT 3,
      "is_available" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "staff_skills_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "staff_skills_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "support_departments"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "support_tickets" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "ticket_number" VARCHAR(50) NOT NULL,
      "requester_id" VARCHAR(150),
      "requester_type" VARCHAR(50) NOT NULL DEFAULT 'passenger',
      "subject" VARCHAR(255) NOT NULL,
      "description" TEXT NOT NULL,
      "department_id" UUID,
      "category" VARCHAR(100) NOT NULL DEFAULT 'general',
      "priority" VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
      "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
      "assigned_admin_id" UUID,
      "confidence_score" DOUBLE PRECISION,
      "ai_summary" TEXT,
      "sla_due_date" TIMESTAMPTZ(6),
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "support_tickets_ticket_number_key" UNIQUE ("ticket_number"),
      CONSTRAINT "support_tickets_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "support_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "ticket_assignment_history" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "ticket_id" UUID NOT NULL,
      "assigned_admin_id" UUID NOT NULL,
      "candidate_score" DOUBLE PRECISION NOT NULL,
      "workload_score" DOUBLE PRECISION NOT NULL,
      "skill_score" DOUBLE PRECISION NOT NULL,
      "availability_score" DOUBLE PRECISION NOT NULL,
      "assigned_reason" TEXT,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ticket_assignment_history_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "ticket_assignment_history_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "ai_feedback" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "query" TEXT NOT NULL,
      "ai_answer" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "comment" TEXT,
      "is_verified" BOOLEAN NOT NULL DEFAULT false,
      "admin_id" UUID,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
    );
  `)

  // Seed default Support Departments
  await prisma.supportDepartment.upsert({
    where: { code: 'general' },
    update: {},
    create: {
      name: 'General Support',
      code: 'general',
      description: 'General customer and driver support inquiries',
    },
  })

  await prisma.supportDepartment.upsert({
    where: { code: 'billing' },
    update: {},
    create: {
      name: 'Billing & Refunds',
      code: 'billing',
      description: 'Payment disputes, fare calculations, and refund processing',
    },
  })

  await prisma.supportDepartment.upsert({
    where: { code: 'technical' },
    update: {},
    create: {
      name: 'Technical & Account',
      code: 'technical',
      description: 'App login, account verification, and technical bugs',
    },
  })

  await prisma.supportDepartment.upsert({
    where: { code: 'operations' },
    update: {},
    create: {
      name: 'Operations & Safety',
      code: 'operations',
      description: 'Emergency assistance, ride safety, and operational issues',
    },
  })

  // Seed 5 Manager Users, 5 Support Specialists, and Staff Skill department assignments
  await seedAdminUsers(prisma)

  console.log('✅ AI & Support Ticket tables, departments, 5 Managers, and 5 Support Specialists verified successfully!')
}

main()
  .catch((e) => console.error('Error applying tables:', e))
  .finally(() => prisma.$disconnect())
