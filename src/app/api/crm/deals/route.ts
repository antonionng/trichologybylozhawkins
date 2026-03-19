import { NextResponse } from "next/server";
import { upsertDeal } from "@/server/modules/crm/service";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const deal = await upsertDeal(body);
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save deal" },
      { status: 400 }
    );
  }
}

