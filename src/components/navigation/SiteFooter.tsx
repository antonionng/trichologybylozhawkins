import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

const footerLinks = {
  explore: [
    { label: "Courses", href: "/education" },
    { label: "Consultations", href: "/services" },
    { label: "Knowledge Hub", href: "/blog" },
  ],
  company: [
    { label: "About Lorraine", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  contact: [
    { label: "hello@lorrainehawkins.com", href: "mailto:hello@lorrainehawkins.com" },
    { label: "+44 (0)20 1234 5678", href: "tel:+442012345678" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-graphite/10 bg-brand-ivory">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="font-display text-xl text-brand-graphite">Trichology by Lorraine Hawkins</p>
          <p className="text-sm leading-relaxed text-brand-graphite/70">
            A restorative, science-led space guiding scalp health journeys for stylists, educators, and clients.
          </p>
          <ButtonLink href="/contact" size="sm" variant="secondary" textured className="mt-2 w-fit">
            Start a conversation
          </ButtonLink>
        </div>
        <FooterColumn heading="Explore" links={footerLinks.explore} />
        <FooterColumn heading="Company" links={footerLinks.company} />
        <FooterColumn heading="Connect" links={footerLinks.contact} newTab />
      </Container>
      <div className="border-t border-brand-graphite/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-brand-graphite/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lorraine Hawkins. All rights reserved.</p>
          <p>Crafted with Neural Network Group Limited.</p>
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
      <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/60">{heading}</p>
      <ul className="space-y-2 text-sm text-brand-graphite/75">
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





