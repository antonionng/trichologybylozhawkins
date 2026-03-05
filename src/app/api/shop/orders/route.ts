import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { listOrders } from "@/server/modules/shop/service";

export async function GET(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const { searchParams } = new URL(request.url);
    const orders = await listOrders({
      status: (searchParams.get("status") as any) ?? undefined,
      query: searchParams.get("q") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 30),
      offset: Number(searchParams.get("offset") ?? 0),
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list orders" },
      { status: 400 },
    );
  }
}

