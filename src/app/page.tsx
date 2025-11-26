import { HomeHero } from "@/components/sections/HomeHero";
import { EducationShowcase } from "@/components/sections/EducationShowcase";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { BlogHighlightsSection } from "@/components/sections/BlogHighlightsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { ConsultationCta } from "@/components/sections/ConsultationCta";

export default function Home() {
  return (
    <main>
      <HomeHero />
      <EducationShowcase />
      <ServicesShowcase />
      <ConsultationCta />
      <TestimonialsSection />
      <BlogHighlightsSection />
      <FaqSection />
    </main>
  );
}
