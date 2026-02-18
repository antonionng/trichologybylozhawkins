export const dynamic = "force-dynamic";

import { getCourse } from "@/app/actions/education";
import { CourseEditor } from "@/components/dashboard/education/CourseEditor";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { notFound } from "next/navigation";

interface Props {
  params: {
    courseId: string;
  };
}

export default async function CourseEditorPage({ params }: Props) {
  const course = await getCourse(params.courseId);

  if (!course) {
    notFound();
  }

  let heroUrl: string | null = null;
  if ((course as any).heroMedia?.path) {
    try { heroUrl = await createSignedDownloadUrl((course as any).heroMedia.path); } catch { /* use null */ }
  }

  return <CourseEditor course={course} heroUrl={heroUrl} />;
}
