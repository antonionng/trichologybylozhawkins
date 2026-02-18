import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { requireCourseAccess } from "@/server/modules/education/access";
import { Surface } from "@/components/layout/Surface";
import { LessonContent } from "@/components/academy/LessonContent";
import { LessonResources } from "@/components/academy/LessonResources";
import { KeyTakeawaysCard } from "@/components/academy/KeyTakeawaysCard";
import { ReflectionPrompt } from "@/components/academy/ReflectionPrompt";
import { LessonSidebar } from "@/components/academy/LessonSidebar";
import { CompletionCelebration } from "@/components/academy/CompletionCelebration";
import { LessonGate } from "@/components/academy/LessonGate";
import { parseLessonContent } from "@/lib/lessonContentParser";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

type KnowledgeCheckItem = {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type ContentJson = {
  text?: string;
  resources?: Array<{ title: string; type: string; content: string }>;
  knowledgeCheck?: KnowledgeCheckItem[];
} | null;

function deriveLessonType(
  hasContent: boolean,
  hasVideo: boolean,
  hasResources: boolean,
): string {
  if (hasContent && hasResources) return "Theory & Practice";
  if (hasContent && hasVideo) return "Theory & Video";
  if (hasContent) return "Theory Lesson";
  if (hasVideo) return "Video Lesson";
  return "Lesson";
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const { user } = await requireUserOrRedirect();
  await requireCourseAccess({ userId: user.id, courseId: params.courseId });

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: { orderBy: { position: "asc" } } },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
      downloadable: true,
    },
  });

  if (!lesson || lesson.module.courseId !== params.courseId) {
    notFound();
  }

  const course = lesson.module.course;

  const allLessons = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id })),
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  const totalLessons = allLessons.length;
  const progressPct =
    totalLessons > 0
      ? Math.round(((currentIndex + 1) / totalLessons) * 100)
      : 0;
  const isLastLesson = currentIndex === totalLessons - 1;

  // Is this the last lesson in its module?
  const moduleLessons = lesson.module.course.modules.find(
    (m) => m.id === lesson.moduleId,
  )?.lessons ?? [];
  const maxPosition = Math.max(...moduleLessons.map((l) => l.position));
  const isLastInModule = lesson.position === maxPosition;

  // Lesson progress
  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });
  const isCompleted = Boolean(lessonProgress?.completedAt);

  // Module quiz check (only for last lesson in module)
  let moduleQuizId: string | null = null;
  let moduleQuizTitle: string | null = null;
  let moduleQuizPassed = false;

  if (isLastInModule) {
    const moduleQuiz = await prisma.quiz.findFirst({
      where: { moduleId: lesson.moduleId, status: "PUBLISHED" },
      select: { id: true, title: true },
    });
    if (moduleQuiz) {
      moduleQuizId = moduleQuiz.id;
      moduleQuizTitle = moduleQuiz.title;

      const contact = user.contactId
        ? await prisma.quizAttempt.findFirst({
            where: {
              quizId: moduleQuiz.id,
              contactId: user.contactId,
              passed: true,
            },
          })
        : null;
      moduleQuizPassed = Boolean(contact);
    }
  }

  let videoSignedUrl: string | null = null;
  if (lesson.videoUrl) {
    try { videoSignedUrl = await createSignedDownloadUrl(lesson.videoUrl); } catch { /* use null */ }
  }
  let downloadSignedUrl: string | null = null;
  if (lesson.downloadable?.filePath) {
    try { downloadSignedUrl = await createSignedDownloadUrl(lesson.downloadable.filePath); } catch { /* use null */ }
  }

  const contentJson = lesson.content as ContentJson;
  const contentText = contentJson?.text ?? null;
  const resources = contentJson?.resources ?? [];
  const knowledgeCheck = contentJson?.knowledgeCheck ?? null;

  const parsed = contentText
    ? parseLessonContent(contentText)
    : { body: "", takeaways: [], reflection: null, tips: [], headings: [] };

  const wordCount = contentText ? contentText.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const lessonType = deriveLessonType(
    Boolean(contentText),
    Boolean(videoSignedUrl),
    resources.length > 0,
  );

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div>
        <Link
          href={`/academy/${params.courseId}`}
          className="mb-2 inline-block text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black"
        >
          ← Back to course
        </Link>

        <div className="mb-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-[#fab826] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-black/40">
            {currentIndex + 1} / {totalLessons}
          </span>
        </div>

        <p className="text-xs uppercase tracking-[0.25em] text-black/40">
          {lesson.module.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-black">{lesson.title}</h1>
          <span className="rounded-full bg-[#fab826]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b67400]">
            {lessonType}
          </span>
          {contentText && (
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-medium text-black/45">
              {readingTime} min read
            </span>
          )}
          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
              ✓ Completed
            </span>
          )}
        </div>

        {lesson.description ? (
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            {lesson.description}
          </p>
        ) : null}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Left column — main content */}
        <div className="min-w-0 space-y-6">
          {/* Key Takeaways at the top */}
          {parsed.takeaways.length > 0 && (
            <KeyTakeawaysCard takeaways={parsed.takeaways} />
          )}

          {/* Theory body */}
          {parsed.body ? (
            <Surface variant="card" padding="lg">
              <LessonContent text={parsed.body} />
            </Surface>
          ) : (
            <Surface variant="card" padding="lg">
              <p className="text-sm italic text-black/50">
                Written content for this lesson is being prepared. Check back
                soon.
              </p>
            </Surface>
          )}

          {/* Reflection prompt */}
          {parsed.reflection && <ReflectionPrompt text={parsed.reflection} />}

          {/* Resources */}
          {resources.length > 0 && (
            <div id="lesson-resources">
              <Surface variant="card" padding="lg">
                <LessonResources resources={resources} />
              </Surface>
            </div>
          )}

          {/* Video + Downloads */}
          {(videoSignedUrl || lesson.downloadable) && (
            <div className="grid gap-6 sm:grid-cols-2">
              {videoSignedUrl ? (
                <Surface variant="card" padding="lg" className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                      Supplementary
                    </p>
                    <h2 className="text-xl font-semibold text-black">Video</h2>
                  </div>
                  <video
                    controls
                    className="w-full rounded-2xl border border-black/10 bg-black/5"
                    src={videoSignedUrl}
                  />
                </Surface>
              ) : null}

              {lesson.downloadable ? (
                <Surface variant="card" padding="lg" className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                      Downloads
                    </p>
                    <h2 className="text-xl font-semibold text-black">Files</h2>
                  </div>
                  <a
                    href={downloadSignedUrl ?? "#"}
                    className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 p-4 transition hover:border-brand-salmon/30 hover:bg-brand-salmon/5"
                  >
                    <div>
                      <p className="font-semibold text-black group-hover:text-brand-salmon">
                        {lesson.downloadable.title}
                      </p>
                      <p className="text-xs text-black/50">
                        {lesson.downloadable.mimeType ?? "Download"}
                      </p>
                    </div>
                    <span className="text-black/30 group-hover:text-brand-salmon">
                      ↓
                    </span>
                  </a>
                </Surface>
              ) : null}
            </div>
          )}

          {/* Completion celebration */}
          {isLastLesson && isCompleted && (
            <CompletionCelebration
              courseId={course.id}
              totalLessons={totalLessons}
            />
          )}

          {/* Knowledge check, module quiz, and navigation */}
          <LessonGate
            lessonId={lesson.id}
            courseId={course.id}
            nextLessonId={nextLesson?.id ?? null}
            nextLessonTitle={nextLesson?.title ?? null}
            prevLessonId={prevLesson?.id ?? null}
            prevLessonTitle={prevLesson?.title ?? null}
            isCompleted={isCompleted}
            knowledgeCheck={knowledgeCheck}
            moduleQuizId={moduleQuizId}
            moduleQuizTitle={moduleQuizTitle}
            moduleQuizPassed={moduleQuizPassed}
            isLastInModule={isLastInModule}
          />
        </div>

        {/* Right column — sticky sidebar */}
        <LessonSidebar
          headings={parsed.headings}
          tips={parsed.tips}
          resources={resources.map((r) => ({ title: r.title, type: r.type }))}
          readingTime={readingTime}
          lessonType={lessonType}
        />
      </div>
    </div>
  );
}
