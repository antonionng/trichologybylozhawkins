import { NextResponse } from "next/server";
import { logActivity } from "@/server/modules/crm/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activity = await logActivity(body);
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to log activity",
      },
      { status: 400 }
    );
  }
}

