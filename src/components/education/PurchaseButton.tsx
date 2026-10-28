"use client";

import { startCheckout } from "@/app/actions/education";
import { DigitalContentConsent } from "@/components/education/DigitalContentConsent";
import { Button } from "@/components/ui/Button";
import { DIGITAL_CONTENT_CONSENT_ERROR } from "@/lib/digitalContentConsent";
import { useState } from "react";

export function PurchaseButton({
  courseId,
  priceId,
  amount,
  currency,
}: {
  courseId: string;
  priceId?: string;
  amount: number;
  currency: string;
  courseSlug?: string;
  isLoggedIn?: boolean;
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
      await startCheckout(courseId, priceId, {
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

  const label = currency === "GBP" ? `£${amount}` : `${currency} ${amount}`;

  return (
    <div className="space-y-4">
      <DigitalContentConsent
        id={`digital-content-consent-${courseId}`}
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
        {loading ? "Enrolling..." : `Enrol for ${label}`}
      </Button>
    </div>
  );
}
