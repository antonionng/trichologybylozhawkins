import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { createProduct, listPublishedProducts } from "@/server/modules/shop/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const products = await listPublishedProducts({
      categorySlug: searchParams.get("category") ?? undefined,
      query: searchParams.get("q") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 24),
      offset: Number(searchParams.get("offset") ?? 0),
      includeDrafts: scope === "admin",
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const created = await createProduct(body);
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save product" },
      { status: 400 },
    );
  }
}

