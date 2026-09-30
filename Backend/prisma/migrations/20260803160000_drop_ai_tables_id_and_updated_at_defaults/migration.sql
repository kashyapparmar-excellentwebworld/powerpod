-- AlterTable
ALTER TABLE "ai_config" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ai_feedback" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "guidance_chunks" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "guidance_documents" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "staff_skills" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "support_departments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ticket_assignment_history" ALTER COLUMN "id" DROP DEFAULT;
