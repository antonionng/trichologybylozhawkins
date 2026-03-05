import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { getOrder, updateOrderStatus } from "@/server/modules/shop/service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireUser({ role: "ADMIN" });
    const order = await getOrder(params.id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch order" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const order = await updateOrderStatus(params.id, body);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 400 },
    );
  }
}

