import { NextResponse } from "next/server";
import { listEntries, upsertEntry } from "@/server/modules/cms/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") ?? undefined;

  try {
    const entries = await listEntries(collection ?? undefined);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to list entries",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = await upsertEntry(body);
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save entry" },
      { status: 400 }
    );
  }
}

