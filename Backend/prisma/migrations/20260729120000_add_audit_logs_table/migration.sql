CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "admin_id" UUID,
  "admin_email" VARCHAR(255),
  "admin_name" VARCHAR(255),
  "action" VARCHAR(100) NOT NULL,
  "module" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "details" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");
CREATE INDEX IF NOT EXISTS "audit_logs_module_idx" ON "audit_logs"("module");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_admin_id_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" 
  FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
