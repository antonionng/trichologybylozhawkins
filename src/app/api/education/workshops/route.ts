import { NextResponse } from "next/server";
import {
  getWorkshopCatalog,
  getAdminWorkshopCatalog,
  upsertWorkshop,
  deleteWorkshop,
} from "@/server/modules/education/workshops";
import { requireUser } from "@/server/security/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "public";
  const slug = searchParams.get("slug") ?? undefined;

  try {
    const workshops =
      scope === "admin"
        ? (await requireUser({ role: "ADMIN" }), await getAdminWorkshopCatalog())
        : await getWorkshopCatalog(slug);
    return NextResponse.json(workshops);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch workshops" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const workshop = await upsertWorkshop(body);
    return NextResponse.json(workshop);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save workshop" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Workshop ID is required" }, { status: 400 });
    }
    await deleteWorkshop(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete workshop" },
      { status: 400 }
    );
  }
}
