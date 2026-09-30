-- AlterTable
ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "hf_token" TEXT;
ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "hf_model" VARCHAR(255) DEFAULT 'BAAI/bge-base-en-v1.5';
ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_enabled" BOOLEAN DEFAULT false;
ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_api_key" TEXT;
ALTER TABLE "ai_config" ADD COLUMN IF NOT EXISTS "langsmith_project" VARCHAR(255) DEFAULT 'wasla-ai-support';
