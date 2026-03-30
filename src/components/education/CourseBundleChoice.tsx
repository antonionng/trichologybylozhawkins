"use client";

import { useState } from "react";
import { PurchaseButton } from "@/components/education/PurchaseButton";
import { ButtonLink } from "@/components/ui/Button";

type CourseBundleChoiceProps =
  | {
      mode?: "inline" | "modal";
      triggerLabel?: string;
      triggerClassName?: string;
      title?: string;
      description?: string;
      singleCourseLabel?: string;
      bundleLabel?: string;
      companionTitle: string;
      bundleHref: string;
      checkoutHref: string;
      courseId?: never;
      priceId?: never;
      amount?: never;
      currency?: never;
    }
  | {
      mode?: "inline" | "modal";
      triggerLabel?: string;
      triggerClassName?: string;
      title?: string;
      description?: string;
      singleCourseLabel?: string;
      bundleLabel?: string;
      companionTitle: string;
      bundleHref: string;
      checkoutHref?: never;
      courseId: string;
      priceId?: string;
      amount: number;
      currency: string;
    };

export function CourseBundleChoice({
  mode = "inline",
  triggerLabel = "Start Course",
  triggerClassName,
  title = "Choose your learning path",
  description,
  singleCourseLabel = "Buy this course only",
  bundleLabel = "Get the full bundle",
  companionTitle,
  bundleHref,
  checkoutHref,
  courseId,
  priceId,
  amount,
  currency,
}: CourseBundleChoiceProps) {
  const [isOpen, setIsOpen] = useState(false);

  const bodyCopy =
    description ??
    `Continue with this course on its own, or add ${companionTitle} for the full bundle offer.`;

  const content = (
    <div className="space-y-5 rounded-[28px] border border-[#b67400]/20 bg-[linear-gradient(180deg,#fffdf6_0%,#fff6df_100%)] p-5 text-left shadow-[0_18px_40px_rgba(182,116,0,0.12)] sm:p-6">
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#b67400]">
          Bundle option
        </p>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold leading-tight text-black">{title}</h2>
          <p className="text-sm leading-relaxed text-black/65">{bodyCopy}</p>
        </div>
        <div className="rounded-2xl border border-[#fab826]/30 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b67400]">
            Bundle value
          </p>
          <p className="mt-1 text-sm text-black/75">
            Add <span className="font-semibold text-black">{companionTitle}</span> before checkout if you want the complete training path.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {checkoutHref ? (
          <ButtonLink
            href={checkoutHref}
            variant="secondary"
            size="md"
            className="min-h-12 w-full justify-center text-center"
          >
            {singleCourseLabel}
          </ButtonLink>
        ) : (
          <PurchaseButton
            courseId={courseId}
            priceId={priceId}
            amount={amount}
            currency={currency}
          />
        )}

        <ButtonLink
          href={bundleHref}
          variant="ghost"
          size="md"
          className="min-h-12 w-full justify-center border-[#b67400]/20 bg-white/80 text-center text-black hover:border-[#b67400]/35 hover:bg-white"
        >
          {bundleLabel}
        </ButtonLink>
      </div>
    </div>
  );

  if (mode === "inline") {
    return content;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/95 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55"
              aria-label="Close bundle choice"
            >
              Close
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
