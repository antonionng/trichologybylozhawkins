import { NextResponse } from "next/server";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await handleCheckoutFulfillment(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fulfill checkout",
      },
      { status: 400 }
    );
  }
}

