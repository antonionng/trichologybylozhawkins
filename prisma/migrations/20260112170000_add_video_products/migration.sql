-- CreateEnum
CREATE TYPE "VideoSourceType" AS ENUM ('UPLOAD', 'LINK');

-- CreateTable
CREATE TABLE "VideoProduct" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "category" TEXT,
    "durationMinutes" INTEGER,
    "heroMediaId" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "videoSourceType" "VideoSourceType" NOT NULL DEFAULT 'UPLOAD',
    "videoPath" TEXT,
    "videoUrl" TEXT,
    "publicContent" JSONB DEFAULT '{}',
    "memberContent" JSONB DEFAULT '{}',
    "meta" JSONB,

    CONSTRAINT "VideoProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoProductPrice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoProductId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "billingType" "BillingType" NOT NULL DEFAULT 'ONE_TIME',
    "billingCycle" "BillingCycle",
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "priceExternalId" TEXT,

    CONSTRAINT "VideoProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoAccess" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT NOT NULL,
    "videoProductId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "VideoAccess_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "videoProductId" TEXT,
ADD COLUMN     "videoPriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VideoProduct_slug_key" ON "VideoProduct"("slug");

-- CreateIndex
CREATE INDEX "VideoProductPrice_videoProductId_isPrimary_idx" ON "VideoProductPrice"("videoProductId", "isPrimary");

-- CreateIndex
CREATE INDEX "VideoAccess_contactId_status_idx" ON "VideoAccess"("contactId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VideoAccess_contactId_videoProductId_key" ON "VideoAccess"("contactId", "videoProductId");

-- CreateIndex
CREATE INDEX "OrderItem_videoProductId_idx" ON "OrderItem"("videoProductId");

-- AddForeignKey
ALTER TABLE "VideoProduct" ADD CONSTRAINT "VideoProduct_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoProductPrice" ADD CONSTRAINT "VideoProductPrice_videoProductId_fkey" FOREIGN KEY ("videoProductId") REFERENCES "VideoProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAccess" ADD CONSTRAINT "VideoAccess_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAccess" ADD CONSTRAINT "VideoAccess_videoProductId_fkey" FOREIGN KEY ("videoProductId") REFERENCES "VideoProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAccess" ADD CONSTRAINT "VideoAccess_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_videoProductId_fkey" FOREIGN KEY ("videoProductId") REFERENCES "VideoProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_videoPriceId_fkey" FOREIGN KEY ("videoPriceId") REFERENCES "VideoProductPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

