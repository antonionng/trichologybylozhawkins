import { NextResponse } from "next/server";
import { upsertAudienceMember } from "@/server/modules/email/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member = await upsertAudienceMember(body);
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save member",
      },
      { status: 400 }
    );
  }
}

