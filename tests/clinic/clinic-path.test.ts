import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatClinicAddress, siteContact } from "@/lib/siteContact";
import { isClinicMarketingHost } from "@/lib/siteHost";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Knutsford clinic path", () => {
  it("publishes a real street address and phone without inventing prices", () => {
    expect(formatClinicAddress()).toBe("27 Regent Street, Knutsford, WA16 6GR");
    expect(siteContact.phoneDisplay).toBe("07834 614092");

    const clinicPage = readRepoFile("src/components/clinic/ClinicPageView.tsx");
    expect(clinicPage).toContain("27 Regent Street");
    expect(clinicPage).toContain("Knutsford");
    expect(clinicPage).toContain("WA16 6GR");
    expect(clinicPage).toContain(siteContact.phoneDisplay);
    expect(clinicPage).toContain("24–48 hours");
    expect(clinicPage).toContain("no online calendar");
    expect(clinicPage).not.toContain("£");
    expect(clinicPage).not.toContain("TestimonialsSection");
    expect(clinicPage).not.toContain("5-star");
    expect(readRepoFile("src/app/clinic/page.tsx")).toContain("ClinicPageView");
  });

  it("links clinic from public nav and footer", () => {
    const header = readRepoFile("src/components/navigation/SiteHeader.tsx");
    const footer = readRepoFile("src/components/navigation/SiteFooter.tsx");

    expect(header).toContain('{ href: "/clinic", label: "Clinic" }');
    expect(footer).toContain('{ label: "Knutsford clinic", href: "/clinic" }');
    expect(footer).toContain("formatClinicAddress()");
  });

  it("only leans harder on clinic for the historic clinic hostname", () => {
    expect(isClinicMarketingHost("trichologybylorrainehawkins.co.uk")).toBe(true);
    expect(isClinicMarketingHost("www.trichologybylorrainehawkins.co.uk:443")).toBe(true);
    expect(isClinicMarketingHost("trichologyacademy.co.uk")).toBe(false);
    expect(isClinicMarketingHost("trichology.vercel.app")).toBe(false);
  });
});
