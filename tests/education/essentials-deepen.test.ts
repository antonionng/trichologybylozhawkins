import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseEssentialsChairChecks } from "@/lib/essentialsChairChecks";
import {
  ESSENTIALS_COURSE_SLUG,
  ESSENTIALS_MODULES,
  essentialsLessonVideoPath,
  essentialsOnePagerStoragePath,
  findEssentialsLessonSpec,
  findEssentialsModuleSpec,
  lastLessonOfModule,
} from "@/lib/essentialsDeepen";
import { markdownToSimplePdf } from "@/lib/simplePdf";
import { courseLessonSchema } from "@/server/schema/education";
import { quizCreateSchema } from "@/server/modules/education/quiz";
import { isHttpMediaUrl } from "@/lib/mediaUrl";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepo(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Essentials deepen catalog", () => {
  it("covers the five published lessons and three modules without new SKUs", () => {
    expect(ESSENTIALS_COURSE_SLUG).toBe("salon-trichology-essentials");
    expect(ESSENTIALS_MODULES).toHaveLength(3);
    expect(ESSENTIALS_MODULES.flatMap((mod) => mod.lessons)).toHaveLength(5);
    expect(
      findEssentialsLessonSpec(
        "Recognising Common Scalp Concerns",
        "The scalp conditions you'll see most often",
      )?.slug,
    ).toBe("scalp-conditions");
    expect(findEssentialsModuleSpec("Know Your Boundaries")?.quiz.slug).toBe(
      "essentials-chair-check-boundaries",
    );
    expect(
      lastLessonOfModule([
        { position: 0, id: "a" },
        { position: 1, id: "b" },
      ])?.id,
    ).toBe("b");
    expect(essentialsLessonVideoPath("scalp-conditions")).toBe(
      "courses/salon-trichology-essentials/lessons/scalp-conditions/vo.mp4",
    );
    expect(essentialsOnePagerStoragePath("scalp-hair-quick-screen")).toBe(
      "courses/salon-trichology-essentials/downloads/scalp-hair-quick-screen.pdf",
    );
  });

  it("parses Marketing chair-checks as DRAFT module quizzes", () => {
    const parsed = parseEssentialsChairChecks(readRepo("content/essentials/chair-checks.md"));
    expect(parsed.status).toBe("DRAFT");
    expect(parsed.courseSlug).toBe(ESSENTIALS_COURSE_SLUG);
    expect(parsed.modules).toHaveLength(3);
    expect(parsed.modules.map((quiz) => quiz.questions.length)).toEqual([5, 5, 5]);
    expect(parsed.modules[0].questions[0].correctAnswer).toBe(1);
    expect(parsed.modules[0].questions[1].correctAnswer).toBe(2);
    expect(parsed.modules[0].questions[2].questionType).toBe("TRUE_FALSE");
    expect(parsed.modules[0].questions[2].correctAnswer).toBe(1);
    expect(parsed.modules[2].questions[0].correctAnswer).toBe(2);
    expect(parsed.modules[2].slug).toBe("essentials-chair-check-boundaries");
    expect(parsed.modules.every((quiz) => quiz.title.startsWith("Chair-check:"))).toBe(true);
  });
});

describe("Marketing one-pagers and VO pack", () => {
  it("builds A4 PDFs from the chair-side markdown", () => {
    const markdown = readRepo("content/essentials/one-pagers/scalp-hair-quick-screen.md");
    const pdf = markdownToSimplePdf(markdown);
    expect(pdf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(pdf.toString("latin1")).toContain("Salon Trichology Essentials");
    expect(pdf.toString("latin1")).toContain("quick screen");
    expect(pdf.toString("latin1")).not.toContain("DRAFT PLACEHOLDER");
    expect(pdf.toString("latin1")).toContain("%%EOF");
  });

  it("keeps VO scripts and documented videoUrl paths in content/essentials/vo", () => {
    const voReadme = readRepo("content/essentials/vo/README.md");
    expect(voReadme).toContain("courses/salon-trichology-essentials/lessons/<lesson-slug>/vo.mp4");
    expect(voReadme).toContain("Do **not** invent audio");
    expect(voReadme).toContain("ELEVENLABS_API_KEY");

    for (const file of [
      "lesson-01-scalp-conditions.md",
      "lesson-02-when-hair-loss-is-more-than-normal-shedding.md",
      "lesson-03-starting-the-conversation.md",
      "lesson-04-recommending-products-services.md",
      "lesson-05-scope-of-practice-for-stylists.md",
    ]) {
      const body = readRepo(`content/essentials/vo/${file}`);
      expect(body).toContain("**Script body:**");
      expect(body).toContain("courses/salon-trichology-essentials/lessons/");
    }
  });
});

describe("lesson media + admin schemas", () => {
  it("accepts storage paths and public URLs for lesson videoUrl", () => {
    expect(isHttpMediaUrl("https://cdn.example.com/vo.mp4")).toBe(true);
    expect(
      isHttpMediaUrl("courses/salon-trichology-essentials/lessons/scalp-conditions/vo.mp4"),
    ).toBe(false);

    const pathResult = courseLessonSchema.parse({
      moduleId: "clxxxxxxxxxxxxxxxxxxxxxxx",
      title: "The scalp conditions you'll see most often",
      videoUrl: "courses/salon-trichology-essentials/lessons/scalp-conditions/vo.mp4",
    });
    expect(pathResult.videoUrl).toContain("scalp-conditions/vo.mp4");

    const cleared = courseLessonSchema.parse({
      moduleId: "clxxxxxxxxxxxxxxxxxxxxxxx",
      title: "Lesson",
      videoUrl: "   ",
    });
    expect(cleared.videoUrl).toBeNull();
  });

  it("accepts a module-scoped draft quiz without publishing", () => {
    const parsed = quizCreateSchema.parse({
      courseId: "clxxxxxxxxxxxxxxxxxxxxxxx",
      moduleId: "clyyyyyyyyyyyyyyyyyyyyyyy",
      title: "Chair-check: Recognising Common Scalp Concerns",
      status: "DRAFT",
    });
    expect(parsed.moduleId).toBe("clyyyyyyyyyyyyyyyyyyyyyyy");
    expect(parsed.status).toBe("DRAFT");
  });
});

describe("learner and admin wiring", () => {
  it("plays signed lesson VO and shows the module download CTA", () => {
    const lessonPage = readRepo("src/app/academy/[courseId]/lessons/[lessonId]/page.tsx");
    expect(lessonPage).toContain("LessonVideoPlayer");
    expect(lessonPage).toContain("resolveStoredMediaUrl");
    expect(lessonPage).toContain("LessonDownloadCta");
    expect(lessonPage).toContain('status: "PUBLISHED"');
    expect(lessonPage).not.toContain("Supplementary");
  });

  it("keeps pay-first checkout and does not add SKUs", () => {
    const docs = readRepo("docs/essentials-deepen.md");
    expect(docs).toContain("trichology");
    expect(docs).toContain("Do **not** add course or video SKUs");
    expect(docs).toContain("TEST Live Course/Product A/B stay unpublished");
    expect(docs).toContain("Pay-first checkout is unchanged");
    expect(docs).toContain("content/essentials/");
    expect(docs).toContain("Do not generate ElevenLabs audio unless `ELEVENLABS_API_KEY` is available");

    const script = readRepo("scripts/essentials-deepen.ts");
    expect(script).toContain("status: QuizStatus.DRAFT");
    expect(script).not.toMatch(/status:\s*QuizStatus\.PUBLISHED/);
    expect(script).toContain("never creates SKUs");
    expect(script).toContain("parseEssentialsChairChecks");
  });

  it("lets admin attach a module quiz and a lesson video path", () => {
    const quizEditor = readRepo("src/components/dashboard/education/QuizEditor.tsx");
    expect(quizEditor).toContain("Course module (chair-check)");
    expect(quizEditor).toContain("moduleId: form.moduleId || null");

    const newQuiz = readRepo("src/app/dashboard/education/quizzes/new/page.tsx");
    expect(newQuiz).toContain("moduleId: moduleId || undefined");
    expect(newQuiz).toContain('status: "DRAFT"');

    const courseEditor = readRepo("src/components/dashboard/education/CourseEditor.tsx");
    expect(courseEditor).toContain("Save video path");
    expect(courseEditor).toContain("videoUrl path");
  });
});

describe("LessonGate chair-check copy", () => {
  it("prompts for a published module quiz as a chair-check", () => {
    const gate = readRepo("src/components/academy/LessonGate.tsx");
    expect(gate).toContain("Chair-check required");
    expect(gate).toContain("/academy/quizzes/${moduleQuizId}");
    expect(gate).toContain("Pass the chair-check to continue");
    expect(gate).toContain("Take chair-check");
  });
});

describe("LessonVideoPlayer", () => {
  it("renders a poster play surface before playback", () => {
    const player = readRepo("src/components/academy/LessonVideoPlayer.tsx");
    expect(player).toContain("Play lesson");
    expect(player).toContain("/images/video-placeholder.svg");
    expect(player).toContain('preload="metadata"');
    expect(player).toContain("formatDuration");
  });
});
