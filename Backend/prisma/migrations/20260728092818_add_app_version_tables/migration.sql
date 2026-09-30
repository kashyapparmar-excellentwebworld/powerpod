-- CreateEnum
CREATE TYPE "AppPlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "AppVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "app_versions" (
    "id" UUID NOT NULL,
    "platform" "AppPlatform" NOT NULL,
    "current_version" VARCHAR(50) NOT NULL,
    "minimum_supported" VARCHAR(50) NOT NULL,
    "recommended_version" VARCHAR(50) NOT NULL,
    "force_update" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" TEXT,
    "rollout_percentage" INTEGER NOT NULL DEFAULT 100,
    "play_store_url" TEXT,
    "app_store_url" TEXT,
    "web_url" TEXT,
    "status" "AppVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_version_translations" (
    "id" UUID NOT NULL,
    "app_version_id" UUID NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "update_button_text" VARCHAR(100) NOT NULL DEFAULT 'Update Now',
    "skip_button_text" VARCHAR(100) NOT NULL DEFAULT 'Later',
    "maintenance_title" VARCHAR(255) NOT NULL DEFAULT 'Application Under Maintenance',
    "maintenance_description" TEXT NOT NULL DEFAULT 'We are performing scheduled maintenance. Please try again later.',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "app_version_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_version_history" (
    "id" UUID NOT NULL,
    "app_version_id" UUID,
    "platform" "AppPlatform" NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "release_notes" TEXT,
    "released_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_version_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_version_check_logs" (
    "id" BIGSERIAL NOT NULL,
    "platform" "AppPlatform" NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "device_id" VARCHAR(150),
    "user_id" VARCHAR(150),
    "ip" VARCHAR(45),
    "result" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_version_check_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_version_audit_logs" (
    "id" UUID NOT NULL,
    "app_version_id" UUID,
    "platform" "AppPlatform" NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "changes" JSONB,
    "performed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_version_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "app_versions_platform_status_idx" ON "app_versions"("platform", "status");

-- CreateIndex
CREATE INDEX "app_version_translations_language_code_idx" ON "app_version_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "app_version_translations_app_version_id_language_code_key" ON "app_version_translations"("app_version_id", "language_code");

-- CreateIndex
CREATE INDEX "app_version_history_platform_version_idx" ON "app_version_history"("platform", "version");

-- CreateIndex
CREATE INDEX "app_version_check_logs_platform_created_at_idx" ON "app_version_check_logs"("platform", "created_at");

-- CreateIndex
CREATE INDEX "app_version_check_logs_result_idx" ON "app_version_check_logs"("result");

-- CreateIndex
CREATE INDEX "app_version_audit_logs_app_version_id_idx" ON "app_version_audit_logs"("app_version_id");

-- CreateIndex
CREATE INDEX "app_version_audit_logs_created_at_idx" ON "app_version_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "app_version_translations" ADD CONSTRAINT "app_version_translations_app_version_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "app_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_version_history" ADD CONSTRAINT "app_version_history_app_version_id_fkey" FOREIGN KEY ("app_version_id") REFERENCES "app_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
