-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "faqs" JSONB DEFAULT '[]',
ADD COLUMN     "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetAudience" TEXT[] DEFAULT ARRAY[]::TEXT[];
