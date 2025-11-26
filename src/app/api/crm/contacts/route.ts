import { NextResponse } from "next/server";
import { LifecycleStage } from "@prisma/client";
import { listContacts, upsertContact } from "@/server/modules/crm/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const lifecycleStageParam = searchParams.get("lifecycleStage") as
    | LifecycleStage
    | null;
  const ownerId = searchParams.get("ownerId") ?? undefined;
  const companyId = searchParams.get("companyId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  try {
    const result = await listContacts({
      page,
      pageSize,
      lifecycleStage: lifecycleStageParam ?? undefined,
      ownerId,
      companyId,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list contacts" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contact = await upsertContact(body);
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save contact" },
      { status: 400 }
    );
  }
}

