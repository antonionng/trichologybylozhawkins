import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AcademyTabs } from "@/components/academy/AcademyTabs";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    fill?: boolean;
  }) => React.createElement("img", props),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("tab=library"),
}));

vi.mock("@/lib/visualAssets", () => ({
  photography: {
    hero: {
      src: "/hero.jpg",
      alt: "Lorraine",
    },
  },
}));

vi.mock("@/lib/publicQuiz", () => ({
  PROFESSIONAL_GATED_QUIZ_HREF: "/quiz/professional",
}));

vi.mock("@/components/layout/Surface", () => ({
  Surface: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/academy/ProgressRing", () => ({
  ProgressRing: () => React.createElement("div", null, "Progress"),
}));

vi.mock("@/components/academy/ContinueLearningCard", () => ({
  ContinueLearningCard: () => React.createElement("div", null, "Continue learning"),
}));

vi.mock("@/components/academy/LearningMetrics", () => ({
  LearningMetrics: () => React.createElement("div", null, "Metrics"),
}));

vi.mock("@/components/academy/ActivityFeed", () => ({
  ActivityFeed: () => React.createElement("div", null, "Activity"),
}));

vi.mock("@/components/education/VideoPurchaseButton", () => ({
  VideoPurchaseButton: () => React.createElement("button", null, "Buy"),
}));

describe("Academy library videos", () => {
  it("shows owned videos in the My Library overview", () => {
    const html = renderToStaticMarkup(
      <AcademyTabs
        myCourses={[]}
        browseCourses={[]}
        quizzes={[]}
        myVideos={[
          {
            id: "video_1",
            slug: "sensitive-scalps",
            title: "Sensitive Scalps",
            subtitle: "Clinical framework",
            category: "Scalp health",
            durationMinutes: 30,
            heroUrl: "/video.jpg",
          },
        ]}
        browseVideos={[]}
        featuredFreeVideoId={null}
        userName="John"
        stats={{
          coursesEnrolled: 0,
          lessonsCompleted: 1,
          quizzesPassed: 0,
          videosWatched: 1,
          learningTimeMinutes: 30,
          overallProgress: 0,
        }}
        continueLesson={null}
        recentActivity={[]}
        weeklyStats={{ thisWeek: 1, lastWeek: 0 }}
        quizMetrics={{ bestScore: null, bestQuizTitle: null, avgScore: null }}
        streak={0}
        nextMilestone={null}
      />,
    );

    expect(html).toContain("My Videos");
    expect(html).toContain('href="/academy/videos/video_1"');
    expect(html).toContain("Sensitive Scalps");
  });
});
