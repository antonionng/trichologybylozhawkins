"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CourseBundleChoice } from "@/components/education/CourseBundleChoice";
import type { CourseBundleOffer } from "@/lib/educationBundles";

type EducationCourseStickyCtaProps = {
  courseTitle: string;
  courseSlug: string;
  bundleOffer: CourseBundleOffer | null;
};

export function EducationCourseStickyCta({
  courseTitle,
  courseSlug,
  bundleOffer,
}: EducationCourseStickyCtaProps) {
  const [bundleModalOpen, setBundleModalOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setBundleModalOpen(!!detail?.open);
    };
    window.addEventListener("education:bundle-modal", handler);
    return () => window.removeEventListener("education:bundle-modal", handler);
  }, []);

  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 backdrop-blur-lg lg:hidden",
        bundleModalOpen && "hidden",
      )}
      aria-hidden={bundleModalOpen}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-xs text-black/50 leading-tight">{courseTitle}</p>
        </div>
        {bundleOffer ? (
          <CourseBundleChoice
            mode="modal"
            triggerLabel="Start Course"
            triggerClassName="inline-flex items-center justify-center rounded-xl bg-[#fab826] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
            companionTitle={bundleOffer.companionTitle}
            bundleHref={bundleOffer.bundleHref}
            checkoutHref={`/education/checkout/${courseSlug}`}
            singleCourseLabel="Continue with this course"
            bundleLabel="Upgrade to bundle"
          />
        ) : (
          <Link
            href={`/education/checkout/${courseSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#fab826] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[#e5a820]"
          >
            Start Course
          </Link>
        )}
      </div>
    </div>
  );
}
