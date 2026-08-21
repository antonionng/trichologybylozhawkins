import { describe, expect, it } from "vitest";
import {
  buildContactPagePrefill,
  buildScalpQuizContactPrefill,
} from "@/lib/scalpQuizContactPrefill";

describe("buildScalpQuizContactPrefill", () => {
  it("creates a clinic enquiry draft from the scalp quiz booking CTA", () => {
    const prefill = buildScalpQuizContactPrefill(
      new URLSearchParams("service=clinic&source=scalp-health-check&concern=Patchy%20hair%20loss%20pattern&urgency=high")
    );

    expect(prefill).toEqual({
      shouldAutoOpen: true,
      enquiryType: "clinic",
      urgency: "high",
      source: "scalp-health-check",
      message: [
        "I completed the scalp health check and would like to book with Lorraine.",
        "",
        "Likely concern: Patchy hair loss pattern",
      ].join("\n"),
    });
  });

  it("ignores unrelated contact links", () => {
    const prefill = buildScalpQuizContactPrefill(new URLSearchParams("service=clinic"));

    expect(prefill).toBeNull();
  });

  it("opens a Knutsford clinic enquiry from service=clinic links", () => {
    const prefill = buildContactPagePrefill(new URLSearchParams("service=clinic"));

    expect(prefill).toEqual({
      shouldAutoOpen: true,
      enquiryType: "clinic",
      urgency: "normal",
      source: "clinic-page",
      message: "I would like to book a trichology consultation in Knutsford.",
    });
  });
});
