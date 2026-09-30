-- AI Config Table
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

-- Guidance Documents Table
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

-- Guidance Chunks Table
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

CREATE INDEX IF NOT EXISTS "guidance_chunks_document_id_idx" ON "guidance_chunks"("document_id");

-- Support Departments Table
CREATE TABLE IF NOT EXISTS "support_departments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "code" VARCHAR(50) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "support_departments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "support_departments_code_key" UNIQUE ("code")
);

-- Staff Skills Table
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

CREATE INDEX IF NOT EXISTS "staff_skills_admin_id_idx" ON "staff_skills"("admin_id");
CREATE INDEX IF NOT EXISTS "staff_skills_department_id_idx" ON "staff_skills"("department_id");

-- Support Tickets Table
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

CREATE INDEX IF NOT EXISTS "support_tickets_department_id_idx" ON "support_tickets"("department_id");
CREATE INDEX IF NOT EXISTS "support_tickets_assigned_admin_id_idx" ON "support_tickets"("assigned_admin_id");
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");
CREATE INDEX IF NOT EXISTS "support_tickets_priority_idx" ON "support_tickets"("priority");

-- Ticket Assignment History Table
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

CREATE INDEX IF NOT EXISTS "ticket_assignment_history_ticket_id_idx" ON "ticket_assignment_history"("ticket_id");
CREATE INDEX IF NOT EXISTS "ticket_assignment_history_assigned_admin_id_idx" ON "ticket_assignment_history"("assigned_admin_id");
