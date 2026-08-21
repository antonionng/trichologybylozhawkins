import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildCanonicalUrl,
  buildClinicJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  getSiteUrl,
} from "@/lib/seo";

describe("seo helpers", () => {
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

  it("uses the configured site url without a trailing slash", () => {
    expect(getSiteUrl()).toBe("https://trichologyacademy.co.uk");
  });

  it("builds canonical urls for relative paths", () => {
    expect(buildCanonicalUrl("/education/videos")).toBe(
      "https://trichologyacademy.co.uk/education/videos",
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
      "https://trichologyacademy.co.uk/services",
    );
    expect(metadata.openGraph?.url).toBe(
      "https://trichologyacademy.co.uk/services",
    );
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://trichologyacademy.co.uk/og-image.png",
        width: 1024,
        height: 703,
        alt: "Lorraine Hawkins social share image",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://trichologyacademy.co.uk/og-image.png",
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
        url: "https://trichologyacademy.co.uk/og-image.png",
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

  it("never uses trichology.vercel.app as the public canonical host", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://trichology.vercel.app";
    expect(getSiteUrl()).toBe("https://trichologyacademy.co.uk");

    process.env.NEXT_PUBLIC_APP_URL = "https://trichologyacademy.com";
    expect(getSiteUrl()).toBe("https://trichologyacademy.co.uk");

    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_APP_URL = "https://example-preview.example";
    expect(getSiteUrl()).toBe("https://trichologyacademy.co.uk");
  });

  it("includes the Knutsford clinic address in organization and clinic json-ld", () => {
    expect(buildOrganizationJsonLd()).toMatchObject({
      url: "https://trichologyacademy.co.uk",
      address: {
        "@type": "PostalAddress",
        streetAddress: "27 Regent Street",
        addressLocality: "Knutsford",
        postalCode: "WA16 6GR",
      },
    });
    expect(buildClinicJsonLd()).toMatchObject({
      "@id": "https://trichologyacademy.co.uk/clinic#clinic",
      telephone: "+447834614092",
      address: {
        streetAddress: "27 Regent Street",
        addressLocality: "Knutsford",
        postalCode: "WA16 6GR",
      },
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
      "@id": "https://trichologyacademy.co.uk/contact#faq",
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
