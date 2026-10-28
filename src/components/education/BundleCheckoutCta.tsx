"use client";

import { useState } from "react";
import { startBundleCheckout } from "@/app/actions/education";
import { DigitalContentConsent } from "@/components/education/DigitalContentConsent";
import { Button } from "@/components/ui/Button";
import { DIGITAL_CONTENT_CONSENT_ERROR } from "@/lib/digitalContentConsent";

export function BundleCheckoutCta({ bundleSlug }: { bundleSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleClick = async () => {
    if (!accepted) {
      alert(DIGITAL_CONTENT_CONSENT_ERROR);
      return;
    }

    setLoading(true);
    try {
      await startBundleCheckout(bundleSlug, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DigitalContentConsent
        id={`digital-content-consent-bundle-${bundleSlug}`}
        checked={accepted}
        onChange={setAccepted}
      />
      <Button
        variant="secondary"
        size="lg"
        className="w-full justify-center"
        onClick={handleClick}
        disabled={loading || !accepted}
      >
        {loading ? "Redirecting to payment..." : "Continue to payment"}
      </Button>
    </div>
  );
}
