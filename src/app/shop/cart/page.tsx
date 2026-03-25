import { CartPageClient, type CartCheckoutInitialState } from "@/components/shop/CartPageClient";
import { prisma } from "@/server/db/client";
import { getCurrentSession } from "@/server/security/auth";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/shop/cart",
  title: "Cart",
  description: "Your current shopping cart.",
  noIndex: true,
});

export default async function CartPage() {
  const session = await getCurrentSession();
  let initialCheckout: CartCheckoutInitialState | undefined;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.uid },
      include: { contact: true },
    });

    if (user) {
      initialCheckout = {
        isAuthenticated: true,
        contactId: user.contactId ?? undefined,
        customer: {
          email: user.contact?.email || user.email,
          firstName: user.contact?.firstName || "",
          lastName: user.contact?.lastName || "",
          phone: user.contact?.phone || "",
        },
      };
    }
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10 sm:px-10 lg:px-12">
      <CartPageClient initialCheckout={initialCheckout} />
    </main>
  );
}

