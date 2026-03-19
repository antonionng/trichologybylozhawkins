import { NextResponse } from "next/server";
import { upsertAutomation } from "@/server/modules/email/service";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const automation = await upsertAutomation(body);
    return NextResponse.json(automation);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save automation",
      },
      { status: 400 }
    );
  }
}

