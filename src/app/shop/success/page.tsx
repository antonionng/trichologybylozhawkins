import Link from "next/link";

export default function ShopSuccessPage() {
  return (
    <main className="mx-auto max-w-[900px] px-6 py-16 text-center sm:px-10">
      <div className="rounded-3xl border border-black/10 bg-white p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-black/45">Order confirmed</p>
        <h1 className="mt-3 text-3xl font-bold text-black">Thank you for your order</h1>
        <p className="mt-3 text-sm text-black/60">
          Your checkout completed successfully. Lorraine&apos;s team will process your products and update status in the dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="rounded-xl bg-brand-graphite px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            Continue shopping
          </Link>
          <Link href="/academy?tab=shop" className="rounded-xl border border-black/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-black">
            Go to academy
          </Link>
        </div>
      </div>
    </main>
  );
}

