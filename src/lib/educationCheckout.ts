import { getSiteUrl } from "@/lib/seo";

export function getEducationCheckoutUrls(cancelPath: string) {
  const base = getSiteUrl();
  return {
    successUrl: `${base}/education/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${base}${cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`}`,
  };
}
