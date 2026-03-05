import { NextResponse } from "next/server";
import { createShopCheckoutSession } from "@/server/modules/shop/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await createShopCheckoutSession(body);
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 400 },
    );
  }
}

