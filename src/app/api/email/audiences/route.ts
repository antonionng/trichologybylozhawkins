import { NextResponse } from "next/server";
import { listAudiences, upsertAudience } from "@/server/modules/email/service";

export async function GET() {
  try {
    const audiences = await listAudiences();
    return NextResponse.json(audiences);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list audiences",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const audience = await upsertAudience(body);
    return NextResponse.json(audience);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save audience",
      },
      { status: 400 }
    );
  }
}

