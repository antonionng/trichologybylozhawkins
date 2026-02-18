-- CreateEnum
CREATE TYPE "ContentChannel" AS ENUM ('GENERIC', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 'PINTEREST', 'X', 'YOUTUBE', 'BLOG', 'EMAIL');

-- CreateEnum
CREATE TYPE "ContentSlotStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentAssetType" AS ENUM ('COPY', 'IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetVariantStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "tags" JSONB,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSlot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT,
    "title" TEXT NOT NULL,
    "brief" TEXT,
    "persona" TEXT,
    "campaign" TEXT,
    "channel" "ContentChannel" NOT NULL DEFAULT 'GENERIC',
    "scheduledFor" TIMESTAMP(3),
    "publishWindowEnd" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "status" "ContentSlotStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "ContentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slotId" TEXT NOT NULL,
    "generationId" TEXT,
    "type" "ContentAssetType" NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "prompt" JSONB,
    "metadata" JSONB,
    "mediaUrl" TEXT,

    CONSTRAINT "ContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetVariant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,
    "platform" "ContentChannel" NOT NULL DEFAULT 'GENERIC',
    "status" "AssetVariantStatus" NOT NULL DEFAULT 'DRAFT',
    "headline" TEXT,
    "copy" TEXT,
    "cta" TEXT,
    "hashtags" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "aspectRatio" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AssetVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentSlot" ADD CONSTRAINT "ContentSlot_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ContentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAsset" ADD CONSTRAINT "ContentAsset_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ContentSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAsset" ADD CONSTRAINT "ContentAsset_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "GeneratedContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVariant" ADD CONSTRAINT "AssetVariant_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ContentAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
