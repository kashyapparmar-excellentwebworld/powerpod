-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "password_reset_expiry" TIMESTAMPTZ(6),
ADD COLUMN     "password_reset_token" TEXT;
