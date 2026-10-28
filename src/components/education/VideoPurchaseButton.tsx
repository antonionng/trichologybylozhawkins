"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { startVideoCheckout } from "@/app/actions/education";
import { DigitalContentConsent } from "@/components/education/DigitalContentConsent";
import { DIGITAL_CONTENT_CONSENT_ERROR } from "@/lib/digitalContentConsent";

export function VideoPurchaseButton({
  videoProductId,
  priceId,
  amount,
  currency,
  checkoutHref,
}: {
  videoProductId: string;
  priceId?: string;
  amount: number;
  currency: string;
  checkoutHref?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handlePurchase = async () => {
    if (!accepted) {
      alert(DIGITAL_CONTENT_CONSENT_ERROR);
      return;
    }

    setLoading(true);
    try {
      await startVideoCheckout(videoProductId, priceId, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const label =
    currency === "GBP" ? `£${amount}` : `${currency} ${amount}`;

  if (checkoutHref) {
    return (
      <ButtonLink
        href={checkoutHref}
        variant="secondary"
        size="md"
        className="w-full justify-center"
      >
        {`Buy for ${label}`}
      </ButtonLink>
    );
  }

  return (
    <div className="space-y-4">
      <DigitalContentConsent
        id={`digital-content-consent-video-${videoProductId}`}
        checked={accepted}
        onChange={setAccepted}
      />
      <Button
        variant="secondary"
        size="md"
        className="w-full justify-center"
        onClick={handlePurchase}
        disabled={loading || !accepted}
      >
        {loading ? "Processing..." : `Buy for ${label}`}
      </Button>
    </div>
  );
}

