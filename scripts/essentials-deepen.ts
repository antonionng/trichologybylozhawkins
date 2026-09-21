/**
 * Salon Trichology Essentials deepen tooling.
 *
 * Safe by default: never publishes quizzes, never creates SKUs,
 * never touches TEST Live Course/Product A/B.
 *
 * Usage:
 *   npx tsx scripts/essentials-deepen.ts status
 *   npx tsx scripts/essentials-deepen.ts pdfs
 *   npx tsx scripts/essentials-deepen.ts quizzes
 *   npx tsx scripts/essentials-deepen.ts attach-videos
 *   npx tsx scripts/essentials-deepen.ts attach-pdfs
 *
 * Env (see docs/essentials-deepen.md):
 *   DATABASE_URL
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET
 *   ESSENTIALS_COURSE_SLUG          default salon-trichology-essentials
 *   ESSENTIALS_VIDEO_FILENAME       default vo.mp4
 *   ESSENTIALS_VIDEO_DIR            optional local folder of VO files named {lesson-slug}.mp4
 *   ESSENTIALS_FORCE                set to 1 to replace existing videoUrl / downloadable
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, QuestionType, QuizStatus } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import {
  ESSENTIALS_COURSE_SLUG,
  ESSENTIALS_MODULES,
  ESSENTIALS_PLACEHOLDER_MARK,
  essentialsLessonVideoPath,
  essentialsOnePagerStoragePath,
  findEssentialsLessonSpec,
  findEssentialsModuleSpec,
  lastLessonOfModule,
  matchByTitleIncludes,
} from "../src/lib/essentialsDeepen";
import { markdownToSimplePdf } from "../src/lib/simplePdf";

type ChairCheckFile = {
  courseSlug: string;
  status: "DRAFT";
  passingScore: number;
  isRequired: boolean;
  isPublic: boolean;
  modules: Array<{
    moduleTitleIncludes: string;
    slug: string;
    title: string;
    description: string;
    questions: Array<{
      questionText: string;
      questionType: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }>;
};

const prisma = new PrismaClient();
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data", "essentials");
const onePagerDir = path.join(dataDir, "one-pagers");

function courseSlug() {
  return process.env.ESSENTIALS_COURSE_SLUG?.trim() || ESSENTIALS_COURSE_SLUG;
}

function forceReplace() {
  return process.env.ESSENTIALS_FORCE === "1";
}

function videoFilename() {
  return process.env.ESSENTIALS_VIDEO_FILENAME?.trim() || "vo.mp4";
}

function getStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) {
    throw new Error(
      "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET are required for upload commands.",
    );
  }
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { client, bucket };
}

async function loadChairChecks(): Promise<ChairCheckFile> {
  const raw = await readFile(path.join(dataDir, "chair-check-quizzes.json"), "utf8");
  return JSON.parse(raw) as ChairCheckFile;
}

async function loadCourse() {
  const slug = courseSlug();
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        include: { lessons: { orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
  });
  if (!course) {
    throw new Error(`Course not found for slug "${slug}". Look up by slug — do not invent a SKU.`);
  }
  return course;
}

async function commandStatus() {
  const course = await loadCourse();
  console.log(`Course: ${course.title} (${course.slug}) status=${course.status}`);
  console.log(`Modules: ${course.modules.length}`);

  for (const mod of course.modules) {
    const spec = findEssentialsModuleSpec(mod.title);
    const quiz = await prisma.quiz.findFirst({
      where: { moduleId: mod.id },
      select: { id: true, title: true, status: true, slug: true },
    });
    const last = lastLessonOfModule(mod.lessons);
    console.log(`\nModule ${mod.position + 1}: ${mod.title}`);
    console.log(`  spec: ${spec?.slug ?? "(unmatched)"}`);
    console.log(
      `  quiz: ${
        quiz
          ? `${quiz.status} ${quiz.title}${quiz.slug ? ` [${quiz.slug}]` : ""}`
          : "none"
      }`,
    );
    for (const lesson of mod.lessons) {
      const isLast = last?.id === lesson.id;
      console.log(
        `  lesson ${lesson.position}: ${lesson.title}` +
          `  videoUrl=${lesson.videoUrl ?? "null"}` +
          `  downloadable=${lesson.downloadableId ?? "null"}` +
          (isLast ? "  [last]" : ""),
      );
    }
  }
}

async function commandPdfs() {
  await mkdir(onePagerDir, { recursive: true });
  for (const mod of ESSENTIALS_MODULES) {
    const mdPath = path.join(onePagerDir, mod.onePager.markdownFile);
    const pdfPath = path.join(onePagerDir, mod.onePager.pdfFile);
    const markdown = await readFile(mdPath, "utf8");
    const pdf = markdownToSimplePdf(markdown);
    await writeFile(pdfPath, pdf);
    console.log(`Wrote ${path.relative(repoRoot, pdfPath)} (${pdf.length} bytes)`);
  }
}

async function commandQuizzes() {
  const file = await loadChairChecks();
  if (file.status !== "DRAFT") {
    throw new Error("chair-check-quizzes.json must keep status DRAFT.");
  }

  const course = await loadCourse();

  for (const quizSpec of file.modules) {
    const courseModule = course.modules.find((mod) =>
      matchByTitleIncludes(mod.title, quizSpec.moduleTitleIncludes),
    );
    if (!courseModule) {
      console.warn(`Skip quiz — no module matching "${quizSpec.moduleTitleIncludes}"`);
      continue;
    }

    const existingBySlug = await prisma.quiz.findUnique({
      where: { slug: quizSpec.slug },
    });
    const existingByModule = await prisma.quiz.findFirst({
      where: { moduleId: courseModule.id },
    });
    const existing = existingBySlug ?? existingByModule;

    if (existing && existing.status === QuizStatus.PUBLISHED && !existing.title.includes(ESSENTIALS_PLACEHOLDER_MARK)) {
      console.log(
        `Skip "${courseModule.title}" — a published non-placeholder quiz already exists (${existing.title}). Publish Marketing copy by editing that quiz.`,
      );
      continue;
    }

    if (existing && existing.status === QuizStatus.PUBLISHED && !forceReplace()) {
      console.log(
        `Skip "${courseModule.title}" — quiz is PUBLISHED. Re-run with ESSENTIALS_FORCE=1 only if you intend to refresh placeholder rows (still will not publish).`,
      );
      continue;
    }

    const quiz = existing
      ? await prisma.quiz.update({
          where: { id: existing.id },
          data: {
            courseId: course.id,
            moduleId: courseModule.id,
            title: quizSpec.title,
            description: quizSpec.description,
            passingScore: file.passingScore,
            isRequired: file.isRequired,
            isPublic: file.isPublic,
            slug: quizSpec.slug,
            status: QuizStatus.DRAFT,
          },
        })
      : await prisma.quiz.create({
          data: {
            courseId: course.id,
            moduleId: courseModule.id,
            title: quizSpec.title,
            description: quizSpec.description,
            passingScore: file.passingScore,
            isRequired: file.isRequired,
            isPublic: file.isPublic,
            slug: quizSpec.slug,
            status: QuizStatus.DRAFT,
          },
        });

    await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    for (let i = 0; i < quizSpec.questions.length; i += 1) {
      const q = quizSpec.questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          position: i,
          questionText: q.questionText,
          questionType:
            q.questionType === "TRUE_FALSE" ? QuestionType.TRUE_FALSE : QuestionType.MULTIPLE_CHOICE,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        },
      });
    }

    console.log(`Upserted DRAFT chair-check "${quiz.title}" on module "${courseModule.title}"`);
  }
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function commandAttachVideos() {
  const course = await loadCourse();
  const filename = videoFilename();
  const localDir = process.env.ESSENTIALS_VIDEO_DIR?.trim();
  const storage = localDir ? getStorage() : null;

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const spec = findEssentialsLessonSpec(mod.title, lesson.title);
      if (!spec) {
        console.warn(`Unmatched lesson (left unchanged): ${mod.title} / ${lesson.title}`);
        continue;
      }

      const storagePath = essentialsLessonVideoPath(spec.slug, filename);
      if (lesson.videoUrl && lesson.videoUrl !== storagePath && !forceReplace()) {
        console.log(`Skip video for "${lesson.title}" — already set to ${lesson.videoUrl}`);
        continue;
      }

      if (localDir && storage) {
        const localFile = path.join(localDir, `${spec.slug}${path.extname(filename) || ".mp4"}`);
        if (await fileExists(localFile)) {
          const bytes = await readFile(localFile);
          const contentType = filename.endsWith(".m4v") ? "video/x-m4v" : "video/mp4";
          const { error } = await storage.client.storage
            .from(storage.bucket)
            .upload(storagePath, bytes, { contentType, upsert: true });
          if (error) throw new Error(`Upload failed for ${localFile}: ${error.message}`);
          console.log(`Uploaded ${localFile} → ${storagePath}`);
        } else {
          console.log(`No local file at ${localFile}; setting path only.`);
        }
      }

      await prisma.courseLesson.update({
        where: { id: lesson.id },
        data: { videoUrl: storagePath },
      });
      console.log(`Set videoUrl for "${lesson.title}" → ${storagePath}`);
    }
  }
}

async function commandAttachPdfs() {
  const course = await loadCourse();
  const storage = getStorage();

  for (const mod of course.modules) {
    const spec = findEssentialsModuleSpec(mod.title);
    if (!spec) {
      console.warn(`Unmatched module (left unchanged): ${mod.title}`);
      continue;
    }
    const last = lastLessonOfModule(mod.lessons);
    if (!last) {
      console.warn(`No lessons on "${mod.title}"`);
      continue;
    }
    if (last.downloadableId && !forceReplace()) {
      console.log(`Skip PDF for "${mod.title}" — last lesson already has a downloadable.`);
      continue;
    }

    const mdPath = path.join(onePagerDir, spec.onePager.markdownFile);
    const markdown = await readFile(mdPath, "utf8");
    const pdf = markdownToSimplePdf(markdown);
    const storagePath = essentialsOnePagerStoragePath(spec.slug);

    const { error } = await storage.client.storage
      .from(storage.bucket)
      .upload(storagePath, pdf, { contentType: "application/pdf", upsert: true });
    if (error) throw new Error(`PDF upload failed: ${error.message}`);

    const asset = last.downloadableId
      ? await prisma.downloadableAsset.update({
          where: { id: last.downloadableId },
          data: {
            courseId: course.id,
            title: spec.onePager.title,
            description: "End-of-module stylist referral / script one-pager",
            filePath: storagePath,
            mimeType: "application/pdf",
          },
        })
      : await prisma.downloadableAsset.create({
          data: {
            courseId: course.id,
            title: spec.onePager.title,
            description: "End-of-module stylist referral / script one-pager",
            filePath: storagePath,
            mimeType: "application/pdf",
          },
        });

    await prisma.courseLesson.update({
      where: { id: last.id },
      data: { downloadableId: asset.id },
    });

    console.log(`Attached "${asset.title}" to last lesson of "${mod.title}" (${storagePath})`);
  }
}

async function main() {
  const command = process.argv[2] ?? "status";
  const allowed = new Set(["status", "pdfs", "quizzes", "attach-videos", "attach-pdfs"]);
  if (!allowed.has(command)) {
    throw new Error(`Unknown command "${command}". Use status | pdfs | quizzes | attach-videos | attach-pdfs`);
  }

  if (command === "pdfs") {
    await commandPdfs();
    return;
  }
  if (command === "status") {
    await commandStatus();
    return;
  }
  if (command === "quizzes") {
    await commandQuizzes();
    return;
  }
  if (command === "attach-videos") {
    await commandAttachVideos();
    return;
  }
  await commandAttachPdfs();
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
