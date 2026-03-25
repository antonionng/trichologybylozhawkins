import type { Metadata } from "next";
import { DM_Sans, Inter, Gentium_Plus } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { getCurrentSession } from "@/server/security/auth";
import dynamic from "next/dynamic";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildWebsiteJsonLd,
  getSiteUrlObject,
} from "@/lib/seo";

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });
const gentium = Gentium_Plus({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-gentium", display: "swap" });

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: `${BRAND_NAME} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  category: "health",
  keywords: [
    "trichology education",
    "scalp health",
    "hair loss education",
    "clinical trichology",
    "lorraine hawkins",
    "trichology courses uk",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: SITE_NAME,
    title: `${BRAND_NAME} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Lorraine Hawkins social share image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  return (
    <html lang="en-GB" className={`${inter.variable} ${dmSans.variable} ${gentium.variable}`}>
      <body>
        <JsonLd data={buildWebsiteJsonLd()} />
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildPersonJsonLd()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-brand-graphite focus:px-4 focus:py-2 focus:text-sm focus:text-brand-ivory"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader session={session} />
          <div id="main-content">{children}</div>
          <SiteFooter />
          <CartDrawer />
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
