import { PageSection } from "@/components/layout/PageSection";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Surface } from "@/components/layout/Surface";

export default function Cookies() {
  return (
    <main>
      <PageSection tone="sand" texture="linen" className="relative">
        <Container className="mx-auto max-w-3xl space-y-8">
          <SectionHeading
            eyebrow="Cookies"
            title="Cookie Policy"
            description="How we use cookies and similar technologies on this website."
            align="center"
          />
          <Surface variant="card" padding="lg" className="space-y-6 text-base leading-relaxed text-brand-graphite/75">
            <p className="text-sm text-brand-graphite/60">Last updated: November 2025</p>
            
            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your experience.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Cookies We Use</h2>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-brand-graphite">Essential Cookies</h3>
                <p>These cookies are necessary for the website to function properly. They enable basic features like:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintaining your session when you're logged in</li>
                  <li>Remembering items in your cart</li>
                  <li>Ensuring secure connections</li>
                </ul>
                <p className="text-sm">These cookies cannot be disabled.</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-brand-graphite">Analytics Cookies (Optional)</h3>
                <p>We may use analytics cookies to understand how visitors use our website. This helps us improve the user experience. These cookies collect anonymous information about:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Which pages are visited most often</li>
                  <li>How long visitors spend on each page</li>
                  <li>Where visitors are coming from</li>
                </ul>
                <p className="text-sm">You can opt out of analytics cookies through your browser settings.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Managing Cookies</h2>
              <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from specific websites</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="text-sm">Note: Blocking essential cookies may affect website functionality.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Third-Party Services</h2>
              <p>We may use third-party services that set their own cookies, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors (for secure transactions)</li>
                <li>Video hosting platforms (for course content)</li>
                <li>Email service providers (for communications)</li>
              </ul>
              <p>These services have their own privacy policies governing cookie use.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Updates to This Policy</h2>
              <p>We may update this cookie policy from time to time. The latest version will always be available on this page with the updated date at the top.</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-xl text-brand-graphite">Questions?</h2>
              <p>If you have questions about how we use cookies, contact us at:</p>
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

