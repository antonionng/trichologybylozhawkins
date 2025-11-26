import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";

export default function Privacy() {
  return (
    <main>
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="mx-auto max-w-3xl space-y-8">
          <SectionHeading
            eyebrow="Privacy"
            title="Privacy Policy"
            description="How we collect, use, and protect your personal information."
            align="center"
          />
          <Surface variant="card" padding="lg" className="space-y-6 text-base leading-relaxed text-brand-graphite/75">
            <p className="text-sm text-brand-graphite/60">Last updated: November 2025</p>
            
            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Information We Collect</h2>
              <p>When you use our services, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact information (name, email, phone number)</li>
                <li>Health information relevant to scalp and hair care consultations</li>
                <li>Payment information for course purchases and services</li>
                <li>Communication records from enquiries and consultations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide consultations and educational services</li>
                <li>Process payments and send receipts</li>
                <li>Respond to your enquiries and provide support</li>
                <li>Send course materials and resources you've purchased</li>
                <li>Improve our services and user experience</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Data Protection</h2>
              <p>We protect your information through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Secure encrypted storage of all personal data</li>
                <li>Limited access to health information on a need-to-know basis</li>
                <li>Regular security audits and updates</li>
                <li>Compliance with UK GDPR and data protection laws</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Cookies and Tracking</h2>
              <p>We use essential cookies to provide our services and may use analytics to improve user experience. See our <a href="/cookies" className="underline decoration-brand-salmon/40 underline-offset-4">Cookie Policy</a> for details.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Contact Us</h2>
              <p>For privacy questions or to exercise your rights, contact us at:</p>
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

