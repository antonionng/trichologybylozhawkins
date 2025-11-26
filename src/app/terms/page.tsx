import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";

export default function Terms() {
  return (
    <main>
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="mx-auto max-w-3xl space-y-8">
          <SectionHeading
            eyebrow="Legal"
            title="Terms & Conditions"
            description="Terms of service for education programmes and consultations."
            align="center"
          />
          <Surface variant="card" padding="lg" className="space-y-6 text-base leading-relaxed text-brand-graphite/75">
            <p className="text-sm text-brand-graphite/60">Last updated: November 2025</p>
            
            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Services Offered</h2>
              <p>Lorraine Hawkins provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Individual scalp health consultations and treatments</li>
                <li>Video courses and downloadable educational materials</li>
                <li>In-person workshops and salon team training</li>
                <li>Professional guidance and business consultation</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Booking and Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Consultations must be booked in advance and require payment confirmation</li>
                <li>Video courses are available for immediate download after purchase</li>
                <li>Workshop bookings require a deposit and are subject to minimum participant numbers</li>
                <li>Payment plans are available—contact us for details</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Cancellations and Refunds</h2>
              <p><strong>Consultations:</strong> Cancel up to 48 hours before your appointment for a full refund. Cancellations within 48 hours are non-refundable but can be rescheduled once.</p>
              <p><strong>Video Courses:</strong> Due to the digital nature of these products, refunds are not available after download access is granted.</p>
              <p><strong>Workshops:</strong> Cancel up to 14 days before the workshop date for a refund minus a 10% admin fee. Cancellations within 14 days are non-refundable but transferable to another participant.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Professional Boundaries</h2>
              <p>Our services provide education and guidance but are not a substitute for medical advice. We recommend consulting with a GP or dermatologist for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sudden or severe hair loss</li>
                <li>Scalp conditions requiring medication</li>
                <li>Underlying health conditions affecting hair growth</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Intellectual Property</h2>
              <p>All course materials, templates, and resources are for personal or single-location business use only. You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Resell or redistribute course materials</li>
                <li>Use materials to create competing courses</li>
                <li>Share login credentials or downloadable content</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Limitation of Liability</h2>
              <p>While we strive to provide accurate, helpful information, we cannot guarantee specific results. Individual outcomes vary based on many factors beyond our control.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Contact</h2>
              <p>For questions about these terms, contact:</p>
              <p>
                <a href="mailto:hello@lorrainehawkins.com" className="underline decoration-brand-salmon/40 underline-offset-4">
                  hello@lorrainehawkins.com
                </a>
              </p>
            </div>
          </Surface>
        </Container>
      </PageSection>
    </main>
  );
}

