-- CreateEnum
CREATE TYPE "ShopCategoryStatus" AS ENUM ('ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ShopProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OUT_OF_STOCK', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShopOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ShopOrderEventType" AS ENUM ('STATUS_CHANGE', 'NOTE', 'TRACKING_UPDATED');

-- CreateTable
CREATE TABLE "ShopCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "status" "ShopCategoryStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ShopCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopProduct" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "price" DECIMAL(14,2) NOT NULL,
    "compareAtPrice" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "sku" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "status" "ShopProductStatus" NOT NULL DEFAULT 'DRAFT',
    "weightGrams" INTEGER,
    "ingredients" TEXT,
    "perfectFor" TEXT,
    "keyIngredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "heroMediaId" TEXT,
    "meta" JSONB,

    CONSTRAINT "ShopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopProductImage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT,

    CONSTRAINT "ShopProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB,
    "subtotalAmount" DECIMAL(14,2) NOT NULL,
    "shippingAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" "ShopOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "providerSessionId" TEXT,
    "providerPaymentIntentId" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopOrderItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "metadata" JSONB,

    CONSTRAINT "ShopOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopOrderEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "type" "ShopOrderEventType" NOT NULL,
    "description" TEXT,
    "payload" JSONB,
    "createdBy" TEXT,

    CONSTRAINT "ShopOrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopCategory_slug_key" ON "ShopCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopProduct_slug_key" ON "ShopProduct"("slug");

-- CreateIndex
CREATE INDEX "ShopProduct_status_idx" ON "ShopProduct"("status");

-- CreateIndex
CREATE INDEX "ShopProduct_categoryId_status_idx" ON "ShopProduct"("categoryId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ShopProductImage_productId_mediaId_key" ON "ShopProductImage"("productId", "mediaId");

-- CreateIndex
CREATE INDEX "ShopProductImage_productId_position_idx" ON "ShopProductImage"("productId", "position");

-- CreateIndex
CREATE INDEX "ShopOrder_status_createdAt_idx" ON "ShopOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ShopOrder_providerSessionId_idx" ON "ShopOrder"("providerSessionId");

-- CreateIndex
CREATE INDEX "ShopOrderItem_orderId_idx" ON "ShopOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "ShopOrderItem_productId_idx" ON "ShopOrderItem"("productId");

-- CreateIndex
CREATE INDEX "ShopOrderEvent_orderId_createdAt_idx" ON "ShopOrderEvent"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "ShopProduct" ADD CONSTRAINT "ShopProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ShopCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopProduct" ADD CONSTRAINT "ShopProduct_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopProductImage" ADD CONSTRAINT "ShopProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ShopProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopProductImage" ADD CONSTRAINT "ShopProductImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrderItem" ADD CONSTRAINT "ShopOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ShopOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrderItem" ADD CONSTRAINT "ShopOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ShopProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrderEvent" ADD CONSTRAINT "ShopOrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ShopOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
