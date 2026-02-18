"use client";

import { startCheckout } from "@/app/actions/education";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PurchaseButton({
  courseId,
  priceId,
  amount,
  currency,
  courseSlug,
  isLoggedIn,
}: {
  courseId: string;
  priceId?: string;
  amount: number;
  currency: string;
  courseSlug?: string;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await startCheckout(courseId, priceId);
    } catch (error) {
      console.error(error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const label = currency === "GBP" ? `£${amount}` : `${currency} ${amount}`;

  return (
    <Button
      variant="secondary"
      size="md"
      className="w-full justify-center"
      onClick={handlePurchase}
      disabled={loading}
    >
      {loading ? "Enrolling..." : `Enrol — ${label}`}
    </Button>
  );
}
