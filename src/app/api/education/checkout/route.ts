import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await createCheckoutSession(body);
    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 400 }
    );
  }
}

