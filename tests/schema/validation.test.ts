import {
  contactUpsertSchema,
  courseUpsertSchema,
  emailCampaignSchema,
} from "@/server/schema";

describe("Schema validation", () => {
  it("validates contact payloads", () => {
    expect(() =>
      contactUpsertSchema.parse({
        firstName: "Ava",
        lastName: "Nguyen",
        email: "ava@example.com",
      })
    ).not.toThrow();
  });

  it("rejects invalid contact emails", () => {
    expect(() =>
      contactUpsertSchema.parse({
        firstName: "Kai",
        lastName: "Lopez",
        email: "not-an-email",
      })
    ).toThrow();
  });

  it("enforces course slug format", () => {
    expect(() =>
      courseUpsertSchema.parse({
        title: "Advanced Scalp Detox",
        slug: "advanced-scalp-detox",
      })
    ).not.toThrow();

    expect(() =>
      courseUpsertSchema.parse({
        title: "Another Course",
        slug: "Invalid Slug",
      })
    ).toThrow();
  });

  it("requires campaign subject", () => {
    expect(() =>
      emailCampaignSchema.parse({
        audienceId: "ckaudience",
        name: "Announcement",
        subject: "",
      })
    ).toThrow();
  });
});

