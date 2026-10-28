export const DIGITAL_CONTENT_CONSENT_TEXT =
  "I agree to the Terms and Conditions, request immediate access to this digital content, and acknowledge that my 14-day cancellation right is lost once access starts.";

export const DIGITAL_CONTENT_CONSENT_ERROR =
  "You must agree to the Terms, request immediate access, and acknowledge that the 14-day cancellation right is lost once access starts.";

export type DigitalContentConsentInput = {
  accepted: boolean;
  acceptedAt: string;
};

export function requireDigitalContentConsent(consent?: DigitalContentConsentInput) {
  if (!consent?.accepted) {
    throw new Error(DIGITAL_CONTENT_CONSENT_ERROR);
  }

  const acceptedAt = new Date(consent.acceptedAt);
  if (Number.isNaN(acceptedAt.getTime())) {
    throw new Error("A valid consent timestamp is required.");
  }

  return {
    digitalContentConsentAccepted: true as const,
    digitalContentConsentAcceptedAt: acceptedAt,
  };
}
