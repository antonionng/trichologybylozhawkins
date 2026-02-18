import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/server/schema";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = getServerEnv();
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured (STRIPE_WEBHOOK_SECRET missing)" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutFulfillment({
          providerSessionId: session.id,
          paymentIntentId: (session.payment_intent as string | null) ?? undefined,
          status: "succeeded",
          payload: event as unknown as Record<string, unknown>,
        });
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutFulfillment({
          providerSessionId: session.id,
          status: "failed",
          payload: event as unknown as Record<string, unknown>,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 400 }
    );
  }
}



