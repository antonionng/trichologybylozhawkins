import { NextResponse } from "next/server";
import { handleCheckoutFulfillment } from "@/server/modules/education/service";
import { getServerEnv } from "@/server/schema";

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const token = request.headers.get("x-bootstrap-token") ?? "";
    if (!env.ADMIN_BOOTSTRAP_TOKEN || token !== env.ADMIN_BOOTSTRAP_TOKEN) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

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

