-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT NOT NULL,
    "requiredCourseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoursePrerequisite_courseId_idx" ON "CoursePrerequisite"("courseId");

-- CreateIndex
CREATE INDEX "CoursePrerequisite_requiredCourseId_idx" ON "CoursePrerequisite"("requiredCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePrerequisite_courseId_requiredCourseId_key" ON "CoursePrerequisite"("courseId", "requiredCourseId");

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_requiredCourseId_fkey" FOREIGN KEY ("requiredCourseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
