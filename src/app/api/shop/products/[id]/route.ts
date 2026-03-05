import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { createProduct, deleteProduct, getProductById, getProductBySlug } from "@/server/modules/shop/service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const product = (await getProductById(params.id)) ?? (await getProductBySlug(params.id));
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch product" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const updated = await createProduct({ ...body, id: params.id });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
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
    await deleteProduct(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 400 },
    );
  }
}

