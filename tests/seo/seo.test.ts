import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildFaqJsonLd,
  buildPageMetadata,
  getSiteUrl,
} from "@/lib/seo";

describe("seo helpers", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://trichologyacademy.com/";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("uses the configured site url without a trailing slash", () => {
    expect(getSiteUrl()).toBe("https://trichologyacademy.com");
  });

  it("builds canonical urls for relative paths", () => {
    expect(buildCanonicalUrl("/education/videos")).toBe(
      "https://trichologyacademy.com/education/videos",
    );
  });

  it("builds metadata with canonical and social image urls", () => {
    const metadata = buildPageMetadata({
      path: "/services",
      title: "Services",
      description: "Clinical consultations and salon team training.",
      imagePath: "/og-image.png",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://trichologyacademy.com/services",
    );
    expect(metadata.openGraph?.url).toBe(
      "https://trichologyacademy.com/services",
    );
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://trichologyacademy.com/og-image.png",
        width: 1024,
        height: 703,
        alt: "Lorraine Hawkins social share image",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://trichologyacademy.com/og-image.png",
    ]);
  });

  it("falls back to the site placeholder for signed social images", () => {
    const metadata = buildPageMetadata({
      path: "/education/example-course",
      title: "Example course",
      description: "Course description",
      imagePath:
        "https://example.supabase.co/storage/v1/object/sign/public/course.png?token=abc123",
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://trichologyacademy.com/og-image.png",
        width: 1024,
        height: 703,
        alt: "Lorraine Hawkins social share image",
      },
    ]);
  });

  it("can mark pages as noindex", () => {
    const metadata = buildPageMetadata({
      path: "/shop/checkout",
      title: "Checkout",
      description: "Secure checkout",
      noIndex: true,
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it("builds faq json-ld with fully qualified ids", () => {
    expect(
      buildFaqJsonLd("/contact", [
        {
          question: "Can Lorraine come to our location?",
          answer: "Yes, across the UK and internationally.",
        },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://trichologyacademy.com/contact#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can Lorraine come to our location?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, across the UK and internationally.",
          },
        },
      ],
    });
  });
});
