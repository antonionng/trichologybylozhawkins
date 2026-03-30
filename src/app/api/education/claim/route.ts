import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerEnv } from "@/server/schema";
import { prisma } from "@/server/db/client";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";
import { generateOpaqueToken, hashToken } from "@/server/security/tokens";
import { getCurrentSession } from "@/server/security/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const body = (await request.json()) as { sessionId?: string };
    const sessionId = String(body.sessionId ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed yet" }, { status: 409 });
    }

    await handleCheckoutFulfillment({
      providerSessionId: session.id,
      paymentIntentId: (session.payment_intent as string | null) ?? undefined,
      status: "succeeded",
      payload: session as unknown as Record<string, unknown>,
    });

    const order = await prisma.order.findFirst({
      where: { providerSessionId: session.id },
      include: { contact: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentSession = await getCurrentSession();

    if (currentSession) {
      const existingUser = await prisma.user.findUnique({
        where: { id: currentSession.uid },
      });
      if (existingUser) {
        if (order.contactId && existingUser.contactId !== order.contactId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { contactId: order.contactId },
          });
        }
        return NextResponse.json({ ok: true, mode: "already-authenticated" });
      }
    }

    const email = order.contact.email.toLowerCase();
    const existingEmailUser = await prisma.user.findUnique({ where: { email } });
    const user = existingEmailUser
      ? order.contactId && existingEmailUser.contactId !== order.contactId
        ? await prisma.user.update({
            where: { id: existingEmailUser.id },
            data: { contactId: order.contactId },
          })
        : existingEmailUser
      : await prisma.user.create({
          data: { email, role: "LEARNER", contactId: order.contactId },
        });

    if (user.passwordHash) {
      return NextResponse.json({ ok: true, mode: "login" });
    }

    const rawToken = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: "INVITE",
        tokenHash: hashToken(rawToken),
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, mode: "set-password", token: rawToken });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to claim purchase" },
      { status: 400 }
    );
  }
}
