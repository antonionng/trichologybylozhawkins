-- Add lead gen quiz fields
ALTER TABLE "Quiz" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Quiz" ADD COLUMN "slug" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "resultsCopy" JSONB;
ALTER TABLE "Quiz" ADD COLUMN "recommendedCourseId" TEXT;

-- Add unique constraint on slug
CREATE UNIQUE INDEX "Quiz_slug_key" ON "Quiz"("slug");

-- Add index on recommendedCourseId
CREATE INDEX "Quiz_recommendedCourseId_idx" ON "Quiz"("recommendedCourseId");

-- Add foreign key constraint
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_recommendedCourseId_fkey" FOREIGN KEY ("recommendedCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

