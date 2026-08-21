'use client';

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { usePathname } from "next/navigation";
import { formatClinicAddress, siteContact, siteContactLinks } from "@/lib/siteContact";

const footerLinks = {
  education: [
    { label: "Video Courses", href: "/education/videos" },
    { label: "Training Courses", href: "/education" },
    { label: "In-Person Workshops", href: "/education#workshops" },
    { label: "Knowledge Hub", href: "/blog" },
    { label: "Conditions Library", href: "/education/conditions" },
  ],
  company: [
    { label: "Knutsford clinic", href: "/clinic" },
    { label: "About Lorraine", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  connect: [
    { label: siteContact.email, href: siteContactLinks.mailto },
    { label: siteContact.phoneDisplay, href: siteContactLinks.tel },
    { label: "Instagram", href: siteContact.instagramUrl },
  ],
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/academy")) {
    return null;
  }
  return (
    <footer className="border-t border-brand-graphite/10 bg-brand-ivory">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand column */}
        <div className="space-y-4 lg:col-span-1">
          <p className="font-display text-lg text-brand-graphite">Lorraine Hawkins</p>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-graphite/50">
            Trichologist · Educator · Practitioner
          </p>
          <p className="text-sm leading-relaxed text-brand-graphite/65">
            Clinical trichology education for hair professionals. Consultations in Knutsford.
          </p>
          <p className="text-sm text-brand-graphite/60">{formatClinicAddress()}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/clinic" size="sm" variant="ghost" className="mt-2 w-fit">
              Clinic
            </ButtonLink>
            <ButtonLink href="/contact" size="sm" variant="secondary" textured className="mt-2 w-fit">
              Get in touch
            </ButtonLink>
          </div>
        </div>

        <FooterColumn heading="Education" links={footerLinks.education} />
        <FooterColumn heading="Company" links={footerLinks.company} />
        <FooterColumn heading="Connect" links={footerLinks.connect} newTab />
      </Container>
      <div className="border-t border-brand-graphite/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-brand-graphite/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Lorraine Hawkins. All rights reserved.</p>
          <p>Built by Neural Network Group Limited.</p>
        </Container>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  heading: string;
  links: readonly { label: string; href: string }[];
  newTab?: boolean;
};

function FooterColumn({ heading, links, newTab }: FooterColumnProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.25em] text-brand-graphite/55">{heading}</p>
      <ul className="space-y-2 text-sm text-brand-graphite/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={newTab && link.href.startsWith("http") ? "_blank" : undefined}
              rel={newTab && link.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition hover:text-brand-graphite"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
