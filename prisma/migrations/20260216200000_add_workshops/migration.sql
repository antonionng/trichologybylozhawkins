-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "longDescription" TEXT,
    "duration" TEXT,
    "investment" TEXT,
    "location" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "heroMediaId" TEXT,
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whoItsFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whatYouGet" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agenda" JSONB DEFAULT '[]',
    "faqs" JSONB DEFAULT '[]',
    "testimonials" JSONB DEFAULT '[]',
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "meta" JSONB,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_slug_key" ON "Workshop"("slug");

-- CreateIndex
CREATE INDEX "Workshop_status_idx" ON "Workshop"("status");

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
