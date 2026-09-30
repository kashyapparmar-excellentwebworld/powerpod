-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('admin', 'supplier', 'buyer');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('admin', 'supplier_web', 'supplier_app', 'buyer_web', 'buyer_app');

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "client_type" "ClientType" NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "device_info" JSONB,
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_entity_type_entity_id_idx" ON "sessions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "sessions_client_type_idx" ON "sessions"("client_type");
