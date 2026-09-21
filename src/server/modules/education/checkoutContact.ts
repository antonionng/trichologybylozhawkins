export const GUEST_CHECKOUT_EMAIL_DOMAIN = "guest.trichologyacademy.local";
export const GUEST_CHECKOUT_SOURCE = "checkout-guest";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function pendingGuestCheckoutEmail(sessionId: string) {
  const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "session";
  return `pending+${safeId}@${GUEST_CHECKOUT_EMAIL_DOMAIN}`;
}

export function isPendingGuestCheckoutContact(contact: {
  email?: string | null;
  source?: string | null;
}) {
  const email = (contact.email ?? "").toLowerCase();
  return (
    contact.source === GUEST_CHECKOUT_SOURCE ||
    email.endsWith(`@${GUEST_CHECKOUT_EMAIL_DOMAIN}`)
  );
}

function checkoutSessionFromPayload(payload?: Record<string, unknown> | null) {
  if (!payload) return null;
  if (isRecord(payload.data) && isRecord(payload.data.object)) {
    return payload.data.object;
  }
  return payload;
}

export function extractCheckoutCustomerEmail(
  payload?: Record<string, unknown> | null,
): string | null {
  const session = checkoutSessionFromPayload(payload);
  if (!session) return null;

  const details = isRecord(session.customer_details) ? session.customer_details : null;
  const candidates = [details?.email, session.customer_email, session.customerEmail];

  for (const value of candidates) {
    if (typeof value === "string" && value.includes("@")) {
      return value.trim().toLowerCase();
    }
  }

  return null;
}

export function extractCheckoutCustomerName(
  payload?: Record<string, unknown> | null,
): { firstName: string; lastName: string } | null {
  const session = checkoutSessionFromPayload(payload);
  if (!session) return null;

  const details = isRecord(session.customer_details) ? session.customer_details : null;
  const rawName = typeof details?.name === "string" ? details.name.trim() : "";
  if (!rawName) return null;

  const [firstName, ...rest] = rawName.split(/\s+/);
  return {
    firstName: firstName || "Learner",
    lastName: rest.join(" ") || "Guest",
  };
}
