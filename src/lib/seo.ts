import type { Metadata } from "next";
import { siteContact } from "@/lib/siteContact";

export const SITE_NAME = "Trichology Academy";
export const BRAND_NAME = "Lorraine Hawkins";
export const DEFAULT_SITE_URL = "https://trichologyacademy.com";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_OG_IMAGE_ALT = "Lorraine Hawkins social share image";
export const DEFAULT_DESCRIPTION =
  "Clinical trichology education, scalp health guidance, consultations, and professional training with Lorraine Hawkins.";

type OpenGraphType = "website" | "article";

export type PageMetadataOptions = {
  path: string;
  title: string;
  description: string;
  imagePath?: string;
  imageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
  openGraphType?: OpenGraphType;
  publishedTime?: string;
  modifiedTime?: string;
};

export type FaqEntry = {
  question: string;
  answer: string;
};

export type BreadcrumbEntry = {
  name: string;
  path: string;
};

type JsonLdRecord = Record<string, unknown>;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) {
    return DEFAULT_SITE_URL;
  }

  try {
    return trimTrailingSlash(new URL(configuredUrl).toString());
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, `${getSiteUrl()}/`).toString();
}

export function buildCanonicalUrl(path: string) {
  return toAbsoluteUrl(path);
}

function buildRobots(noIndex?: boolean): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

function buildSocialImage(
  imagePath = DEFAULT_OG_IMAGE_PATH,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
) {
  const stableImagePath =
    imagePath.includes("/storage/v1/object/sign/") || imagePath.includes("?token=")
      ? DEFAULT_OG_IMAGE_PATH
      : imagePath;

  return {
    url: toAbsoluteUrl(stableImagePath),
    width: 1200,
    height: 630,
    alt: imageAlt,
  };
}

export function buildPageMetadata({
  path,
  title,
  description,
  imagePath,
  imageAlt,
  keywords,
  noIndex,
  openGraphType = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(path);
  const socialImage = buildSocialImage(imagePath, imageAlt);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: buildRobots(noIndex),
    openGraph: {
      type: openGraphType,
      locale: "en_GB",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [socialImage],
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: SITE_NAME,
    url: siteUrl,
    email: siteContact.email,
    telephone: siteContact.phoneE164,
    sameAs: [siteContact.instagramUrl.split("?")[0]],
  };
}

export function buildPersonJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}#person`,
    name: BRAND_NAME,
    url: siteUrl,
    worksFor: {
      "@id": `${siteUrl}#organization`,
    },
    jobTitle: "Clinical trichologist and educator",
  };
}

export function buildWebsiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@id": `${siteUrl}#organization`,
    },
  };
}

export function buildArticleJsonLd({
  path,
  headline,
  description,
  image,
  datePublished,
  dateModified,
}: {
  path: string;
  headline: string;
  description: string;
  image?: string | null;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${buildCanonicalUrl(path)}#article`,
    headline,
    description,
    image: image ? [toAbsoluteUrl(image)] : undefined,
    datePublished,
    dateModified,
    author: {
      "@id": `${getSiteUrl()}#person`,
    },
    publisher: {
      "@id": `${getSiteUrl()}#organization`,
    },
    mainEntityOfPage: buildCanonicalUrl(path),
  };
}

export function buildProductJsonLd({
  path,
  name,
  description,
  image,
  price,
  currency = "GBP",
}: {
  path: string;
  name: string;
  description: string;
  image?: string | null;
  price?: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${buildCanonicalUrl(path)}#product`,
    name,
    description,
    image: image ? [toAbsoluteUrl(image)] : undefined,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers:
      typeof price === "number"
        ? {
            "@type": "Offer",
            price,
            priceCurrency: currency,
            url: buildCanonicalUrl(path),
          }
        : undefined,
  };
}

export function buildCourseJsonLd({
  path,
  name,
  description,
  image,
  providerName = BRAND_NAME,
}: {
  path: string;
  name: string;
  description: string;
  image?: string | null;
  providerName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${buildCanonicalUrl(path)}#course`,
    name,
    description,
    image: image ? [toAbsoluteUrl(image)] : undefined,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: getSiteUrl(),
    },
  };
}

export function buildFaqJsonLd(path: string, faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${buildCanonicalUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  path: string,
  items: BreadcrumbEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${buildCanonicalUrl(path)}#breadcrumbs`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function cleanJsonLd<T extends JsonLdRecord>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, entry) => {
      if (entry === undefined || entry === null) {
        return undefined;
      }
      return entry;
    }),
  ) as T;
}
