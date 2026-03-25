import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBundleBySlug } from "@/server/modules/education/service";
import { getCurrentSession } from "@/server/security/auth";
import { Container } from "@/components/layout/Container";
import { PageSection } from "@/components/layout/PageSection";
import { Surface } from "@/components/layout/Surface";
import { CheckoutAuthClient } from "@/components/education/CheckoutAuthClient";
import { BundleCheckoutCta } from "@/components/education/BundleCheckoutCta";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return buildPageMetadata({
    path: `/education/checkout/bundle/${params.slug}`,
    title: "Bundle checkout",
    description: "Secure bundle checkout.",
    noIndex: true,
  });
}

export default async function BundleCheckoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const [bundle, session] = await Promise.all([
    getBundleBySlug(params.slug),
    getCurrentSession(),
  ]);

  if (!bundle) notFound();

  const priceLabel =
    bundle.currency === "GBP"
      ? `£${bundle.amount}`
      : `${bundle.currency} ${bundle.amount}`;

  return (
    <main>
      <PageSection tone="sand" texture="linen">
        <Container className="mx-auto max-w-xl py-8">
          <Surface variant="card" padding="lg" className="space-y-6">
            <div className="space-y-3 border-b border-black/5 pb-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-bold">
                Bundle checkout
              </p>
              <h1 className="text-xl font-semibold text-black">{bundle.name}</h1>
              <ul className="space-y-1 text-sm text-black/70">
                {bundle.courses.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/education/${c.slug}`}
                      className="text-[#b67400] hover:underline"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-black">
                  {priceLabel}
                </span>
                <span className="rounded-full bg-[#fab826]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#b67400]">
                  Save when you buy both
                </span>
              </div>
            </div>

            {session ? (
              <BundleCheckoutCta bundleSlug={bundle.slug} />
            ) : (
              <>
                <p className="text-sm text-black/60">
                  Create an account or sign in to complete your purchase.
                </p>
                <CheckoutAuthClient bundleSlug={bundle.slug} />
              </>
            )}
          </Surface>
        </Container>
      </PageSection>
    </main>
  );
}
