-- CreateEnum
CREATE TYPE "CmsPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "status" "CmsPageStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_translations" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content_html" TEXT NOT NULL,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "robots" VARCHAR(100) DEFAULT 'index, follow',
    "og_title" VARCHAR(255),
    "og_description" TEXT,
    "og_image" TEXT,
    "twitter_card" VARCHAR(100) DEFAULT 'summary_large_image',
    "published_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cms_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_versions" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content_html" TEXT NOT NULL,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_page_translations_language_code_idx" ON "cms_page_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "cms_page_translations_page_id_language_code_key" ON "cms_page_translations"("page_id", "language_code");

-- CreateIndex
CREATE INDEX "cms_page_versions_page_id_language_code_version_idx" ON "cms_page_versions"("page_id", "language_code", "version");

-- AddForeignKey
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_versions" ADD CONSTRAINT "cms_page_versions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
