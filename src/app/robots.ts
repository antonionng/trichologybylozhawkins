import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/academy/",
          "/dashboard/",
          "/login",
          "/set-password",
          "/shop/cart",
          "/shop/checkout",
          "/shop/success",
          "/education/checkout/",
          "/education/success",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
