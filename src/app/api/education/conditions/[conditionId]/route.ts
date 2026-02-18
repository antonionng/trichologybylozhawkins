import { NextResponse } from "next/server";
import {
  getCondition,
  updateCondition,
  deleteCondition,
  conditionUpdateSchema,
} from "@/server/modules/education/conditions";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { conditionId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const condition = await getCondition(params.conditionId);
    if (!condition) {
      return NextResponse.json({ error: "Condition not found" }, { status: 404 });
    }
    return NextResponse.json(condition);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch condition" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const condition = await updateCondition(
      conditionUpdateSchema.parse({ ...body, id: params.conditionId })
    );
    return NextResponse.json(condition);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update condition" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await deleteCondition(params.conditionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete condition" },
      { status: 400 }
    );
  }
}

