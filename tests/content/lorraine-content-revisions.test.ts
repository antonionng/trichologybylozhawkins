import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { inPersonIntensives, services, videoDetailFallbacks } from "@/lib/content";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Lorraine content revisions", () => {
  it("updates contact availability copy", () => {
    const contactPage = readRepoFile("src/app/contact/ContactPageClient.tsx");

    expect(contactPage).toContain("Training\", detail: \"Mon & Tue · 9am–6pm GMT");
    expect(contactPage).toContain("Consultations\", detail: \"Wed & Thu · 10am–5pm GMT");
  });

  it("updates home hero experience bullets", () => {
    const homeHero = readRepoFile("src/components/sections/HomeHero.tsx");

    expect(homeHero).toContain("25+ years hair industry experience");
    expect(homeHero).toContain("Evidence-based trichology education");
    expect(homeHero).toContain("Professional training & workshops");
  });

  it("updates in-person training copy", () => {
    const foundations = inPersonIntensives.find((programme) => programme.id === "intensive-foundations");
    const advancedWorkshop = inPersonIntensives.find((programme) => programme.id === "intensive-regenerative-detox");
    const workshopService = services.find((service) => service.id === "service-workshop");

    expect(foundations?.title).toBe("Hair & scalp science education");
    expect(advancedWorkshop?.title).toBe("Advanced Scalp Analysis Workshop");
    expect(advancedWorkshop?.summary.toLowerCase()).toContain("scoping");
    expect(workshopService?.name).toBe("Advanced Scalp Analysis Workshop");
    expect(workshopService?.description.toLowerCase()).toContain("scoping");
    expect(
      advancedWorkshop?.faqs.find((faq) => faq.question === "Where are workshops held?")?.answer,
    ).toBe("Workshops will be done in Cheshire or in your own salon space.");
  });

  it("adds medical diagnosis boundary to all pre-recorded fallbacks", () => {
    expect(videoDetailFallbacks.length).toBeGreaterThan(0);

    for (const video of videoDetailFallbacks) {
      expect(video.whatItsNot).toContain("A medical diagnosis");
    }
  });

  it("renames the phase 1 course in structured content and seed copy", () => {
    const structuredCourses = readRepoFile("data/structured/courses.json");
    const seedFile = readRepoFile("prisma/seed.ts");

    expect(structuredCourses).toContain("\"title\": \"Hair & Scalp Foundation Phase 1\"");
    expect(seedFile).toContain("Hair & Scalp Foundation Phase 1");
  });
});
