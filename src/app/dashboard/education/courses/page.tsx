export const dynamic = "force-dynamic";

import { getAdminCourses } from "@/app/actions/education";
import { CourseCatalogTable } from "@/components/dashboard/education/CourseCatalogTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export default async function CourseList() {
  const courses = await getAdminCourses();
  const rows = await Promise.all(
    (courses as any[]).map(async (course) => {
      let heroUrl: string | null = null;
      if (course.heroMedia?.path) {
        try { heroUrl = await createSignedDownloadUrl(course.heroMedia.path); } catch { /* use null */ }
      }
      return { ...course, heroUrl };
    }),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Course Catalog"
        subtitle="Manage courses, curriculum, media, pricing, and cohorts"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Courses" },
        ]}
        actions={
          <AdminButton href="/dashboard/education/courses/new" variant="primary" size="md">
            + New Course
          </AdminButton>
        }
      />
      <CourseCatalogTable courses={rows as any} />
    </div>
  );
}
