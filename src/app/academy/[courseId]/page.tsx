import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { requireCourseAccess } from "@/server/modules/education/access";
import { Surface } from "@/components/layout/Surface";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

export default async function AcademyCoursePage({ params }: { params: { courseId: string } }) {
  const { user } = await requireUserOrRedirect();
  await requireCourseAccess({ userId: user.id, courseId: params.courseId });

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: { include: { lessons: true }, orderBy: { position: "asc" } },
      downloads: true,
    },
  });

  if (!course) notFound();

  const downloads = await Promise.all(
    course.downloads.map(async (asset) => {
      let signedUrl: string | null = null;
      if (asset.filePath) {
        try { signedUrl = await createSignedDownloadUrl(asset.filePath); } catch { /* use null */ }
      }
      return { ...asset, signedUrl };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/academy"
            className="mb-2 inline-block text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black"
          >
            ← Back to Academy
          </Link>
          <h1 className="text-2xl font-semibold text-black">{course.title}</h1>
          <p className="mt-1 text-sm text-black/60">{course.subtitle ?? course.description ?? ""}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Surface variant="card" padding="lg" className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Curriculum</p>
            <h2 className="text-xl font-semibold text-black">Modules & lessons</h2>
          </div>

          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div key={mod.id} className="rounded-2xl border border-black/5 bg-white/75 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-black">{mod.title}</p>
                  <span className="text-xs uppercase tracking-[0.25em] text-black/40">
                    {mod.lessons.length} lessons
                  </span>
                </div>
                {mod.description ? <p className="mt-1 text-sm text-black/60">{mod.description}</p> : null}
                <ul className="mt-3 space-y-2 text-sm">
                  {mod.lessons
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((lesson) => {
                      const contentJson = lesson.content as { text?: string; resources?: unknown[] } | null;
                      const hasContent = Boolean(contentJson?.text);
                      const resourceCount = Array.isArray(contentJson?.resources) ? contentJson.resources.length : 0;
                      return (
                        <li key={lesson.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-black">{lesson.title}</p>
                            <div className="flex items-center gap-2">
                              {lesson.description ? (
                                <p className="truncate text-xs text-black/50">{lesson.description}</p>
                              ) : null}
                              {hasContent && (
                                <span className="shrink-0 rounded-full bg-[#fab826]/15 px-2 py-0.5 text-[10px] font-medium text-[#b67400]">
                                  Theory
                                </span>
                              )}
                              {resourceCount > 0 && (
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                  {resourceCount} {resourceCount === 1 ? "Resource" : "Resources"}
                                </span>
                              )}
                              {lesson.videoUrl && (
                                <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/40">
                                  Video
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/academy/${course.id}/lessons/${lesson.id}`}
                            className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-black/60 hover:border-black/20 hover:text-black"
                          >
                            Open
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}

            {course.modules.length === 0 ? (
              <p className="text-sm text-black/60">
                Curriculum is being prepared. Check back soon or contact support if you need access urgently.
              </p>
            ) : null}
          </div>
        </Surface>

        <Surface variant="card" padding="lg" className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">Downloads</p>
            <h2 className="text-xl font-semibold text-black">Resources</h2>
          </div>
          <div className="grid gap-3">
            {downloads.map((asset) => (
              <a
                key={asset.id}
                href={asset.signedUrl ?? "#"}
                className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 p-4 transition hover:border-brand-salmon/30 hover:bg-brand-salmon/5"
              >
                <div>
                  <p className="font-semibold text-black group-hover:text-brand-salmon">{asset.title}</p>
                  <p className="text-xs text-black/50">{asset.mimeType ?? "Download"}</p>
                </div>
                <span className="text-black/30 group-hover:text-brand-salmon">↓</span>
              </a>
            ))}

            {downloads.length === 0 ? (
              <p className="text-sm text-black/60">
                No downloads yet. Lorraine can add worksheets, transcripts, and templates in the course editor.
              </p>
            ) : null}
          </div>
        </Surface>
      </div>
    </div>
  );
}



