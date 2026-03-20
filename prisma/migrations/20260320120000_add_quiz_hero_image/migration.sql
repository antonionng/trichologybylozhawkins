-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "heroMediaId" TEXT,
ADD COLUMN "cardImageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Quiz_heroMediaId_idx" ON "Quiz"("heroMediaId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
