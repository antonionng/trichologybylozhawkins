import { NextResponse } from "next/server";
import { getContactById, updateContact } from "@/server/modules/crm/service";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const contact = await getContactById(id);
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contact" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const body = await request.json();
    const updated = await updateContact({ id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update contact" },
      { status: 400 }
    );
  }
}


