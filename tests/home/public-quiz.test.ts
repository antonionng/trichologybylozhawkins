import { describe, expect, it } from "vitest";
import {
  FEATURED_PUBLIC_QUIZ_HREF,
  FEATURED_PUBLIC_QUIZ_LABEL,
  FEATURED_PUBLIC_QUIZ_NAV_LABEL,
  FEATURED_PUBLIC_QUIZ_RESULT_LABEL,
  FEATURED_PUBLIC_QUIZ_SLUG,
} from "@/lib/publicQuiz";

describe("public quiz constants", () => {
  it("builds the featured public quiz href from the shared slug", () => {
    expect(FEATURED_PUBLIC_QUIZ_SLUG).toBe("scalp-health-check");
    expect(FEATURED_PUBLIC_QUIZ_HREF).toBe("/quiz/scalp-health-check");
  });

  it("exposes stable CTA copy for quiz entry points", () => {
    expect(FEATURED_PUBLIC_QUIZ_LABEL).toBe("Check your scalp symptoms");
    expect(FEATURED_PUBLIC_QUIZ_NAV_LABEL).toBe("Scalp Quiz");
    expect(FEATURED_PUBLIC_QUIZ_RESULT_LABEL).toBe("Book a scalp consultation with Lorraine");
  });
});
