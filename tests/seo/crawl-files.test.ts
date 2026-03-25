import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("crawl metadata files", () => {
  it("disallows private and transactional routes in robots", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(rules).toBeTruthy();
    expect(rules?.disallow).toContain("/dashboard/");
    expect(rules?.disallow).toContain("/academy/");
    expect(rules?.disallow).toContain("/shop/cart");
    expect(config.sitemap).toBe("https://trichologyacademy.com/sitemap.xml");
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

    expect(urls).toContain("https://trichologyacademy.com/");
    expect(urls).toContain("https://trichologyacademy.com/education");
    expect(urls).toContain("https://trichologyacademy.com/blog");
    expect(urls).not.toContain("https://trichologyacademy.com/shop/cart");
  });
});
