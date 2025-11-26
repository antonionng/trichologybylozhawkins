import type { Metadata } from "next";
import { DM_Sans, Inter, Gentium_Plus } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });
const gentium = Gentium_Plus({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-gentium", display: "swap" });

export const metadata: Metadata = {
  title: "Trichology by Lorraine Hawkins",
  description:
    "Clinical trichology consultations, immersive education, and AI-enabled marketing for scalp health leaders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${gentium.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-brand-graphite focus:px-4 focus:py-2 focus:text-sm focus:text-brand-ivory"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <ChatWidget />
      </body>
    </html>
  );
}
