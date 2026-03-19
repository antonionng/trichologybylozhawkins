import { NextResponse } from "next/server";
import { registerMediaAsset } from "@/server/modules/cms/service";
import { requireUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const asset = await registerMediaAsset(body);
    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save asset" },
      { status: 400 }
    );
  }
}

