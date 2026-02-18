import { notFound, redirect } from "next/navigation";
import { getCourseBySlug } from "@/app/actions/education";
import { getCurrentSession } from "@/server/security/auth";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { Surface } from "@/components/layout/Surface";
import { CheckoutAuthClient } from "@/components/education/CheckoutAuthClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: { slug: string } }) {
  const session = await getCurrentSession();

  if (session) {
    redirect(`/education/${params.slug}`);
  }

  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const primaryPrice = course.pricing.find((p: any) => p.isPrimary) || course.pricing[0];
  const priceLabel = primaryPrice
    ? primaryPrice.currency === "GBP"
      ? `£${primaryPrice.amount}`
      : `${primaryPrice.currency} ${primaryPrice.amount}`
    : null;

  return (
    <main>
      <PageSection tone="sand" texture="linen">
        <Container className="mx-auto max-w-xl py-8">
          <Surface variant="card" padding="lg" className="space-y-6">
            <div className="space-y-3 border-b border-black/5 pb-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-bold">
                Checkout
              </p>
              <h1 className="text-xl font-semibold text-black">{course.title}</h1>
              {priceLabel && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-black">{priceLabel}</span>
                  <span className="rounded-full bg-[#fab826]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b67400]">
                    Lifetime access
                  </span>
                </div>
              )}
              <p className="text-sm text-black/60">
                Create an account or sign in to complete your purchase.
              </p>
            </div>

            <CheckoutAuthClient
              courseId={course.id}
              priceId={primaryPrice?.id}
              courseSlug={course.slug}
            />
          </Surface>
        </Container>
      </PageSection>
    </main>
  );
}
