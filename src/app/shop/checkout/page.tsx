import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/shop/checkout",
  title: "Checkout",
  description: "Secure checkout.",
  noIndex: true,
});

export default function ShopCheckoutPage() {
  redirect("/shop/cart");
}

