import { JsonLd } from "@/components/seo/JsonLd";
import ContactPageClient from "./ContactPageClient";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

const contactFaqs = [
  {
    question: "Can Lorraine come to our location?",
    answer:
      "Yes, across the UK, Europe, North America, and the Middle East. Travel and workshop logistics are discussed during booking.",
  },
  {
    question: "Do you offer payment plans?",
    answer:
      "Payment options are available for individuals and salon teams, and these can be discussed during the initial consultation.",
  },
  {
    question: "How many can attend a workshop?",
    answer:
      "Workshops are best for 4 to 15 participants, with larger teams supported across multiple sessions where needed.",
  },
];

export const metadata = buildPageMetadata({
  path: "/contact",
  title: "Contact Lorraine Hawkins",
  description:
    "Contact Lorraine Hawkins for trichology consultations, scalp health support, salon team training, and workshop enquiries.",
  keywords: [
    "contact lorraine hawkins",
    "book trichology consultation",
    "salon training enquiry",
    "scalp health support",
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={buildFaqJsonLd("/contact", contactFaqs)} />
      <ContactPageClient />
    </>
  );
}
