export type CourseBundleOffer = {
  bundleSlug: string;
  bundleHref: string;
  companionTitle: string;
};

const SHARED_BUNDLE_SLUG = "phase-1-clinical-practice";

export function getCourseBundleOffer(courseSlug: string): CourseBundleOffer | null {
  if (courseSlug === "trichocare-phase-1") {
    return {
      bundleSlug: SHARED_BUNDLE_SLUG,
      bundleHref: `/education/checkout/bundle/${SHARED_BUNDLE_SLUG}`,
      companionTitle: "Trichology in Clinical Practice",
    };
  }

  if (courseSlug === "trichology-clinical-practice") {
    return {
      bundleSlug: SHARED_BUNDLE_SLUG,
      bundleHref: `/education/checkout/bundle/${SHARED_BUNDLE_SLUG}`,
      companionTitle: "Hair & Scalp Foundation Phase 1",
    };
  }

  return null;
}
