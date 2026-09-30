-- Enable pgvector Extension if available in PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- AI Feedback Table
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

CREATE INDEX IF NOT EXISTS "ai_feedback_rating_idx" ON "ai_feedback"("rating");
CREATE INDEX IF NOT EXISTS "ai_feedback_is_verified_idx" ON "ai_feedback"("is_verified");
