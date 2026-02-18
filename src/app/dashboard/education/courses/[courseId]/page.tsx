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

  const heroUrl = (course as any).heroMedia?.path
    ? await createSignedDownloadUrl((course as any).heroMedia.path)
    : null;

  return <CourseEditor course={course} heroUrl={heroUrl} />;
}
