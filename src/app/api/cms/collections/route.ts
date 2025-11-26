import { NextResponse } from "next/server";
import { listCollections, upsertCollection } from "@/server/modules/cms/service";

export async function GET() {
  try {
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

