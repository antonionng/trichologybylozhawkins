import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { createCategory, deleteCategory } from "@/server/modules/shop/service";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const category = await createCategory({ ...body, id: params.id });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update category" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireUser({ role: "ADMIN" });
    await deleteCategory(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete category" },
      { status: 400 },
    );
  }
}

