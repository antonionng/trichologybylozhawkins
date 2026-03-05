import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { createCategory, listAllCategories, listCategories } from "@/server/modules/shop/service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const categories = scope === "admin" ? await listAllCategories() : await listCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch categories" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const category = await createCategory(body);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 400 },
    );
  }
}

