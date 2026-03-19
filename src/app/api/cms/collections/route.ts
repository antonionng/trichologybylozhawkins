import { NextResponse } from "next/server";
import { listCollections, upsertCollection } from "@/server/modules/cms/service";
import { requireUser } from "@/server/security/auth";

export async function GET() {
  try {
    await requireUser({ role: "ADMIN" });
    const collections = await listCollections();
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list collections",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const collection = await upsertCollection(body);
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save collection",
      },
      { status: 400 }
    );
  }
}

