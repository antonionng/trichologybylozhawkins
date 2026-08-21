import { afterEach, beforeEach, describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("crawl metadata files", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it("disallows private and transactional routes in robots", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(rules).toBeTruthy();
    expect(rules?.disallow).toContain("/dashboard/");
    expect(rules?.disallow).toContain("/academy/");
    expect(rules?.disallow).toContain("/shop/cart");
    expect(config.sitemap).toBe("https://trichologyacademy.co.uk/sitemap.xml");
    expect(config.host).toBe("https://trichologyacademy.co.uk");
  });

  it("publishes a manifest with branded icons", () => {
    const config = manifest();

    expect(config.name).toBe("Trichology Academy");
    expect(config.icons?.map((icon) => icon.src)).toContain("/favicon.ico");
    expect(config.icons?.map((icon) => icon.src)).toContain("/apple-touch-icon.png");
  });

  it("includes core public routes in the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://trichologyacademy.co.uk/");
    expect(urls).toContain("https://trichologyacademy.co.uk/education");
    expect(urls).toContain("https://trichologyacademy.co.uk/clinic");
    expect(urls).toContain("https://trichologyacademy.co.uk/blog");
    expect(urls).not.toContain("https://trichologyacademy.co.uk/shop/cart");
    expect(urls.every((url) => !url.includes("trichology.vercel.app"))).toBe(true);
  });
});
