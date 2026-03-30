import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

(globalThis as { React?: typeof React }).React = React;

const getCurrentSessionMock = vi.fn();
const videoProductFindManyMock = vi.fn();
const userFindUniqueMock = vi.fn();
const videoAccessFindManyMock = vi.fn();
const getCurrentFeaturedLeadItemMock = vi.fn();
const createSignedDownloadUrlMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    fill?: boolean;
  }) => React.createElement("img", props),
}));

vi.mock("@/server/security/auth", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    videoProduct: {
      findMany: videoProductFindManyMock,
    },
    user: {
      findUnique: userFindUniqueMock,
    },
    videoAccess: {
      findMany: videoAccessFindManyMock,
    },
  },
}));

vi.mock("@/server/modules/education/featuredLeadItem", () => ({
  getCurrentFeaturedLeadItem: getCurrentFeaturedLeadItemMock,
}));

vi.mock("@/server/storage/supabase", () => ({
  createSignedDownloadUrl: createSignedDownloadUrlMock,
}));

vi.mock("@/components/education/VideoPurchaseButton", () => ({
  VideoPurchaseButton: ({ amount, currency }: { amount: number; currency: string }) =>
    React.createElement("button", null, `Buy for ${currency === "GBP" ? `£${amount}` : `${currency} ${amount}`}`),
}));

vi.mock("@/components/sections/FreeAcademyVideoPromoSection", () => ({
  FreeAcademyVideoPromoSection: () => React.createElement("div", null, "promo"),
}));

vi.mock("@/components/sections/ConsultationCta", () => ({
  ConsultationCta: () => React.createElement("div", null, "consultation"),
}));

vi.mock("@/components/layout/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/ui/Button", () => ({
  ButtonLink: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/lib/topicAccents", () => ({
  getTopicAccent: () => ({
    gradient: "from-black to-white",
    bg: "bg-black/5",
    text: "text-black",
  }),
}));

vi.mock("@/lib/visualAssets", () => ({
  photography: {
    hero: {
      src: "/hero.jpg",
      alt: "Lorraine",
    },
  },
}));

vi.mock("@/lib/seo", () => ({
  buildPageMetadata: () => ({}),
}));

vi.mock("@/lib/content", () => ({
  videoLessons: [],
  videoDetailFallbacks: [],
  VIDEO_HERO_PLACEHOLDER_BY_SLUG: {},
  VIDEO_HERO_PLACEHOLDER_DEFAULT: "/placeholder.jpg",
}));

describe("owned video CTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentFeaturedLeadItemMock.mockResolvedValue(null);
    createSignedDownloadUrlMock.mockResolvedValue(null);
  });

  it("shows a non-purchase CTA in the public video catalog for already owned videos", async () => {
    getCurrentSessionMock.mockResolvedValueOnce({
      uid: "user_1",
      role: "LEARNER",
      exp: 9999999999,
    });
    userFindUniqueMock.mockResolvedValueOnce({
      id: "user_1",
      contactId: "contact_1",
    });
    videoAccessFindManyMock.mockResolvedValueOnce([
      {
        videoProductId: "video_1",
      },
    ]);
    videoProductFindManyMock.mockResolvedValueOnce([
      {
        id: "video_1",
        slug: "sensitive-scalps",
        title: "Sensitive Scalps",
        category: "Scalp health",
        subtitle: "A practical framework",
        publicContent: {
          learningOutcomes: ["Spot irritation triggers"],
        },
        durationMinutes: 32,
        pricing: [
          {
            id: "price_1",
            amount: 29,
            currency: "GBP",
            isPrimary: true,
          },
        ],
        heroMedia: null,
      },
    ]);

    const pageModule = await import("@/app/education/videos/page");
    const html = renderToStaticMarkup(await pageModule.default());

    expect(html).toContain("View video");
    expect(html).not.toContain("Buy for £29");
  });
});
