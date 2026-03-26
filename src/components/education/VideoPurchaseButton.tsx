"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { startVideoCheckout } from "@/app/actions/education";

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

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await startVideoCheckout(videoProductId, priceId);
    } catch (error) {
      console.error(error);
      alert("Failed to start checkout. Please try again.");
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
    <Button
      variant="secondary"
      size="md"
      className="w-full justify-center"
      onClick={handlePurchase}
      disabled={loading}
    >
      {loading ? "Processing..." : `Buy for ${label}`}
    </Button>
  );
}

