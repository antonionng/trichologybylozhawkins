import { NextResponse } from "next/server";
import { bulkUpdateTasks, upsertTask } from "@/server/modules/crm/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await upsertTask(body);
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save task" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await bulkUpdateTasks(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update tasks",
      },
      { status: 400 }
    );
  }
}

