import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CLINIC_MARKETING_HOSTS, isClinicMarketingHost } from "@/lib/siteHost";
import { buildCanonicalUrl, buildPageMetadata, getSiteUrl } from "@/lib/seo";

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("clinic host routing", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://trichologyacademy.co.uk/";
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it("keeps academy pages on the academy host and clinic pages on /clinic", () => {
    expect(getSiteUrl()).toBe("https://trichologyacademy.co.uk");
    expect(buildCanonicalUrl("/")).toBe("https://trichologyacademy.co.uk/");
    expect(buildCanonicalUrl("/education")).toBe(
      "https://trichologyacademy.co.uk/education",
    );
    expect(buildPageMetadata({
      path: "/clinic",
      title: "Knutsford trichology clinic",
      description: "In-person hair and scalp consultations.",
    }).alternates?.canonical).toBe("https://trichologyacademy.co.uk/clinic");
    expect(readRepoFile("src/lib/clinicPageMeta.ts")).toContain('path: "/clinic"');
  });

  it("does not send clinic visitors to the education homepage via canonical", () => {
    const clinicCanonical = buildPageMetadata({
      path: "/clinic",
      title: "Knutsford trichology clinic",
      description: "In-person hair and scalp consultations.",
    }).alternates?.canonical;

    expect(clinicCanonical).toBe("https://trichologyacademy.co.uk/clinic");
    expect(clinicCanonical).not.toBe("https://trichologyacademy.co.uk");
    expect(clinicCanonical).not.toBe("https://trichologyacademy.co.uk/");
  });

  it("rewrites the historic clinic hostname homepage to /clinic and never to the academy host", () => {
    const config = readRepoFile("next.config.mjs");
    const home = readRepoFile("src/app/page.tsx");

    expect(CLINIC_MARKETING_HOSTS).toEqual([
      "trichologybylorrainehawkins.co.uk",
      "www.trichologybylorrainehawkins.co.uk",
    ]);
    expect(isClinicMarketingHost("trichologybylorrainehawkins.co.uk")).toBe(true);
    expect(isClinicMarketingHost("trichologyacademy.co.uk")).toBe(false);
    expect(isClinicMarketingHost("trichology.vercel.app")).toBe(false);

    expect(config).toContain('source: "/"');
    expect(config).toContain('destination: "/clinic"');
    expect(config).toContain("trichologybylorrainehawkins.co.uk");
    expect(config).toContain("www.trichologybylorrainehawkins.co.uk");
    expect(config).not.toMatch(
      /destination:\s*["']https:\/\/trichologyacademy\.co\.uk/,
    );

    expect(home).toContain("isClinicMarketingHost");
    expect(home).toContain("ClinicPageView");
    expect(home).toContain("clinicPageMetadata");
    expect(home).toContain("academyHomeMetadata");
  });

  it("redirects /treatments to /clinic on the same host", () => {
    const config = readRepoFile("next.config.mjs");

    expect(config).toContain('source: "/treatments"');
    expect(config).toContain('destination: "/clinic"');
    expect(config).not.toContain(
      'destination: "https://trichologyacademy.co.uk/clinic"',
    );
    expect(config).not.toContain(
      'destination: "https://trichologyacademy.co.uk/treatments"',
    );
  });

  it("does not 301 trichology.vercel.app", () => {
    const config = readRepoFile("next.config.mjs");
    const middleware = readRepoFile("middleware.ts");

    expect(config).not.toContain("trichology.vercel.app");
    expect(middleware).not.toContain("trichology.vercel.app");
    expect(middleware).not.toContain("trichologyacademy.co.uk");
    expect(middleware).not.toContain("trichologybylorrainehawkins.co.uk");
  });
});
