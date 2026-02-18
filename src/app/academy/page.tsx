import { Suspense } from "react";
import { requireUserOrRedirect } from "@/server/security/auth";
import { listEnrolledCourses, listPurchasedVideos } from "@/server/modules/education/access";
import { prisma } from "@/server/db/client";
import { createSignedDownloadUrl } from "@/server/storage/supabase";
import { AcademyTabs } from "@/components/academy/AcademyTabs";

export const dynamic = "force-dynamic";

async function resolveHeroUrl(item: any): Promise<string | null> {
  if (item.heroMedia?.path) {
    try {
      return await createSignedDownloadUrl(item.heroMedia.path);
    } catch {
      /* fall through */
    }
  }
  const meta = item.meta as Record<string, any> | null;
  return meta?.heroImage ?? null;
}

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const uniqueSet = new Set(dates.map((d) => startOfDay(d).getTime()));
  const unique = Array.from(uniqueSet).sort((a, b) => b - a);
  const today = startOfDay(new Date()).getTime();
  const yesterday = today - 86_400_000;
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i - 1] - unique[i] === 86_400_000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default async function AcademyHome() {
  const { user } = await requireUserOrRedirect();

  const [myCourses, catalogCourses, quizzes, myVideos, catalogVideos] =
    await Promise.all([
      listEnrolledCourses({ userId: user.id }),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        include: {
          heroMedia: true,
          pricing: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          modules: {
            orderBy: { position: "asc" },
            include: {
              _count: { select: { lessons: true } },
              lessons: {
                orderBy: { position: "asc" },
                select: { id: true, title: true, position: true, moduleId: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.quiz.findMany({
        where: { status: "PUBLISHED", isPublic: false },
        include: {
          course: { select: { title: true } },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      listPurchasedVideos({ userId: user.id }),
      prisma.videoProduct.findMany({
        where: { status: "PUBLISHED" },
        include: {
          heroMedia: true,
          pricing: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  // Progress counts per course
  const progressCounts = await prisma.lessonProgress.groupBy({
    by: ["courseId"],
    where: { userId: user.id, completedAt: { not: null } },
    _count: { lessonId: true },
  });
  const progressMap = new Map(
    progressCounts.map((p) => [p.courseId, p._count.lessonId]),
  );

  // Total lessons per course
  const totalLessonsMap = new Map<string, number>();
  for (const c of catalogCourses) {
    const total = c.modules.reduce((sum, m) => sum + m._count.lessons, 0);
    totalLessonsMap.set(c.id, total);
  }

  // ---------- NEW: enriched dashboard data ----------

  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const [
    totalLessonsCompleted,
    quizzesPassed,
    lessonsThisWeek,
    lessonsLastWeek,
    recentLessons,
    quizAttempts,
    allLessonDates,
    videoWatchCount,
    completedLessonIds,
  ] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId: user.id, completedAt: { not: null } },
    }),
    user.contactId
      ? prisma.quizAttempt.count({
          where: { contactId: user.contactId, passed: true },
        })
      : Promise.resolve(0),
    prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completedAt: { not: null, gte: startOfThisWeek },
      },
    }),
    prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completedAt: { not: null, gte: startOfLastWeek, lt: startOfThisWeek },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 8,
      include: {
        lesson: { select: { title: true } },
        course: { select: { title: true } },
      },
    }),
    user.contactId
      ? prisma.quizAttempt.findMany({
          where: { contactId: user.contactId },
          orderBy: { completedAt: "desc" },
          take: 8,
          include: { quiz: { select: { title: true } } },
        })
      : Promise.resolve([]),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      select: { completedAt: true },
    }),
    prisma.videoWatch?.count({ where: { userId: user.id } }).catch(() => 0) ?? Promise.resolve(0),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      select: { lessonId: true },
    }),
  ]);

  // Quiz metrics
  const bestQuiz =
    quizAttempts.length > 0
      ? quizAttempts.reduce((best, a) =>
          a.percentage > best.percentage ? a : best,
        )
      : null;
  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((s, a) => s + a.percentage, 0) /
            quizAttempts.length,
        )
      : null;
  const totalQuizTime = quizAttempts.reduce(
    (s, a) => s + (a.timeSpent ?? 0),
    0,
  );

  // Streak
  const streakDates = allLessonDates
    .map((r) => r.completedAt)
    .filter(Boolean) as Date[];
  const streak = computeStreak(streakDates);

  // Learning time: quiz time + proportional course duration
  let learningTimeMinutes = Math.round(totalQuizTime / 60);
  for (const c of catalogCourses) {
    if (!c.durationMinutes) continue;
    const completed = progressMap.get(c.id) ?? 0;
    const total = totalLessonsMap.get(c.id) ?? 0;
    if (total > 0) {
      learningTimeMinutes += Math.round(
        (completed / total) * c.durationMinutes,
      );
    }
  }

  // Continue learning: find the next incomplete lesson in the most recently active course
  const completedIdSet = new Set(completedLessonIds.map((r) => r.lessonId));
  const myCourseIds = new Set(myCourses.map((c: any) => c.id));

  let continueLesson: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    moduleTitle: string;
    lessonNumber: number;
    totalLessons: number;
  } | null = null;

  // Sort enrolled courses by most recent activity
  const lastActivityByCourse = new Map<string, Date>();
  for (const lp of recentLessons) {
    if (
      lp.completedAt &&
      myCourseIds.has(lp.courseId) &&
      !lastActivityByCourse.has(lp.courseId)
    ) {
      lastActivityByCourse.set(lp.courseId, lp.completedAt);
    }
  }

  const sortedEnrolledCourseIds = Array.from(myCourseIds).sort((a: string, b: string) => {
    const aTime = lastActivityByCourse.get(a)?.getTime() ?? 0;
    const bTime = lastActivityByCourse.get(b)?.getTime() ?? 0;
    return bTime - aTime;
  });

  for (const courseId of sortedEnrolledCourseIds) {
    const catalog = catalogCourses.find((c) => c.id === courseId);
    if (!catalog) continue;
    let lessonIndex = 0;
    for (const mod of catalog.modules) {
      for (const lesson of mod.lessons) {
        lessonIndex++;
        if (!completedIdSet.has(lesson.id)) {
          const total = totalLessonsMap.get(courseId) ?? 0;
          continueLesson = {
            courseId,
            courseTitle: catalog.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            moduleTitle: mod.title,
            lessonNumber: lessonIndex,
            totalLessons: total,
          };
          break;
        }
      }
      if (continueLesson) break;
    }
    if (continueLesson) break;
  }

  // Recent activity feed (merged lessons + quizzes, sorted by date)
  type ActivityItem = {
    type: "lesson" | "quiz";
    title: string;
    context: string;
    date: Date;
    score?: number;
    passed?: boolean;
  };

  const activityItems: ActivityItem[] = [];
  for (const lp of recentLessons) {
    if (lp.completedAt) {
      activityItems.push({
        type: "lesson",
        title: lp.lesson.title,
        context: lp.course.title,
        date: lp.completedAt,
      });
    }
  }
  for (const qa of quizAttempts) {
    if (qa.completedAt) {
      activityItems.push({
        type: "quiz",
        title: qa.quiz.title,
        context: `${Math.round(qa.percentage)}%`,
        date: qa.completedAt,
        score: Math.round(qa.percentage),
        passed: qa.passed,
      });
    }
  }
  activityItems.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivity = activityItems.slice(0, 8).map((item) => ({
    ...item,
    date: item.date.toISOString(),
  }));

  // Next milestone: find closest course/module to completion
  let nextMilestone: string | null = null;
  for (const courseId of sortedEnrolledCourseIds) {
    const completed = progressMap.get(courseId) ?? 0;
    const total = totalLessonsMap.get(courseId) ?? 0;
    if (total > 0 && completed < total) {
      const remaining = total - completed;
      const catalog = catalogCourses.find((c) => c.id === courseId);
      if (remaining <= 3 && catalog) {
        nextMilestone = `${remaining} lesson${remaining === 1 ? "" : "s"} to finish ${catalog.title}!`;
        break;
      }
    }
  }

  // Overall progress across all enrolled courses
  let totalEnrolledLessons = 0;
  let totalCompletedEnrolled = 0;
  for (const courseId of Array.from(myCourseIds)) {
    totalEnrolledLessons += totalLessonsMap.get(courseId as string) ?? 0;
    totalCompletedEnrolled += progressMap.get(courseId as string) ?? 0;
  }
  const overallProgress =
    totalEnrolledLessons > 0
      ? Math.round((totalCompletedEnrolled / totalEnrolledLessons) * 100)
      : 0;

  // User name
  const contact = user.contactId
    ? await prisma.contact.findUnique({
        where: { id: user.contactId },
        select: { firstName: true },
      })
    : null;
  const userName = contact?.firstName ?? null;

  const browseCourses = catalogCourses
    .filter((c: any) => !myCourseIds.has(c.id))
    .filter((c: any) => c.slug !== "academy-quizzes");

  const myVideoIds = new Set(myVideos.map((v: any) => v.id));
  const browseVideos = catalogVideos.filter(
    (v: any) => !myVideoIds.has(v.id),
  );

  const withHeroUrls = async (courses: any[]) =>
    Promise.all(
      courses.map(async (c) => ({
        ...c,
        heroUrl: await resolveHeroUrl(c),
        tagline: (c.meta as any)?.tagline ?? null,
        completedLessons: progressMap.get(c.id) ?? 0,
        totalLessons: totalLessonsMap.get(c.id) ?? 0,
      })),
    );

  const withVideoHeroUrls = async (videos: any[]) =>
    Promise.all(
      videos.map(async (v) => ({
        ...v,
        heroUrl: await resolveHeroUrl(v),
      })),
    );

  const [
    enrichedMyCourses,
    enrichedBrowseCourses,
    enrichedMyVideos,
    enrichedBrowseVideos,
  ] = await Promise.all([
    withHeroUrls(myCourses),
    withHeroUrls(browseCourses),
    withVideoHeroUrls(myVideos),
    withVideoHeroUrls(browseVideos),
  ]);

  return (
    <Suspense>
      <AcademyTabs
        myCourses={enrichedMyCourses as any}
        browseCourses={enrichedBrowseCourses as any}
        quizzes={quizzes as any}
        myVideos={enrichedMyVideos as any}
        browseVideos={enrichedBrowseVideos as any}
        userName={userName}
        stats={{
          coursesEnrolled: myCourses.length,
          lessonsCompleted: totalLessonsCompleted,
          quizzesPassed,
          videosWatched: videoWatchCount,
          learningTimeMinutes,
          overallProgress,
        }}
        continueLesson={continueLesson}
        recentActivity={recentActivity}
        weeklyStats={{ thisWeek: lessonsThisWeek, lastWeek: lessonsLastWeek }}
        quizMetrics={{
          bestScore: bestQuiz ? Math.round(bestQuiz.percentage) : null,
          bestQuizTitle: bestQuiz?.quiz.title ?? null,
          avgScore: avgQuizScore,
        }}
        streak={streak}
        nextMilestone={nextMilestone}
      />
    </Suspense>
  );
}
