import { NextResponse } from "next/server";
import { listActivities, logActivity } from "@/server/modules/crm/service";
import type { ActivityType } from "@prisma/client";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");
  const contactId = searchParams.get("contactId") ?? undefined;
  const companyId = searchParams.get("companyId") ?? undefined;
  const dealId = searchParams.get("dealId") ?? undefined;
  const type = (searchParams.get("type") as ActivityType | null) ?? undefined;
  const sort = (searchParams.get("sort") as "asc" | "desc" | null) ?? undefined;

  try {
    const result = await listActivities({
      page,
      pageSize,
      contactId,
      companyId,
      dealId,
      type,
      sort,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list activities" },
      { status: 400 }
    );
  }
}

