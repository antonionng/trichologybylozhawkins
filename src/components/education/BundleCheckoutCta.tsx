"use client";

import { useState } from "react";
import { startBundleCheckout } from "@/app/actions/education";
import { Button } from "@/components/ui/Button";

export function BundleCheckoutCta({ bundleSlug }: { bundleSlug: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await startBundleCheckout(bundleSlug);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full justify-center"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Redirecting to payment…" : "Continue to payment"}
    </Button>
  );
}
