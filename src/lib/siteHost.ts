const PRODUCTION_CANONICAL_HOST = "trichologyacademy.co.uk";

export const CLINIC_MARKETING_HOSTS = [
  "trichologybylorrainehawkins.co.uk",
  "www.trichologybylorrainehawkins.co.uk",
] as const;

const LEGACY_PUBLIC_HOSTS = new Set([
  "trichology.vercel.app",
  "trichologyacademy.com",
  "www.trichologyacademy.com",
  ...CLINIC_MARKETING_HOSTS,
]);

function normalizeHost(host?: string | null) {
  return (host ?? "").split(":")[0].trim().toLowerCase();
}

export function isClinicMarketingHost(host?: string | null) {
  const hostname = normalizeHost(host);
  return (CLINIC_MARKETING_HOSTS as readonly string[]).includes(hostname);
}

export function isLegacyPublicHost(host?: string | null) {
  const hostname = normalizeHost(host);
  if (!hostname) return false;
  if (hostname.endsWith(".vercel.app")) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  }
  return LEGACY_PUBLIC_HOSTS.has(hostname);
}

export function shouldForceProductionCanonical() {
  return process.env.VERCEL_ENV === "production";
}

export function isProductionCanonicalHost(host?: string | null) {
  return normalizeHost(host) === PRODUCTION_CANONICAL_HOST;
}
