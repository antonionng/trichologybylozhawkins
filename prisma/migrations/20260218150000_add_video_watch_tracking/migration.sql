-- CreateTable
CREATE TABLE "VideoWatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "videoProductId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoWatch_userId_idx" ON "VideoWatch"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoWatch_userId_videoProductId_key" ON "VideoWatch"("userId", "videoProductId");

-- AddForeignKey
ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_videoProductId_fkey" FOREIGN KEY ("videoProductId") REFERENCES "VideoProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
