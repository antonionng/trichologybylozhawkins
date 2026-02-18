import { NextResponse } from "next/server";
import {
  getConditions,
  createCondition,
  conditionCreateSchema,
} from "@/server/modules/education/conditions";
import { ConditionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ConditionStatus | null;

    const conditions = await getConditions(status || undefined);
    return NextResponse.json(conditions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch conditions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const condition = await createCondition(conditionCreateSchema.parse(body));
    return NextResponse.json(condition, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create condition" },
      { status: 400 }
    );
  }
}

