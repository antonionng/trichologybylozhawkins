import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

const csvEscape = (value: unknown) => {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
};

export async function GET(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll("ids").filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "At least one contact ID is required" }, { status: 400 });
    }

    const contacts = await prisma.contact.findMany({
      where: { id: { in: ids } },
      orderBy: { updatedAt: "desc" },
      include: {
        company: true,
        deals: { select: { id: true } },
      },
    });

    const rows = [
      [
        "firstName",
        "lastName",
        "email",
        "phone",
        "lifecycleStage",
        "company",
        "deals",
        "updatedAt",
      ].join(","),
      ...contacts.map((contact) =>
        [
          contact.firstName,
          contact.lastName,
          contact.email,
          contact.phone ?? "",
          contact.lifecycleStage,
          contact.company?.name ?? "",
          contact.deals.length,
          contact.updatedAt.toISOString(),
        ]
          .map(csvEscape)
          .join(","),
      ),
    ];

    return new NextResponse(rows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="crm-contacts-export.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export contacts" },
      { status: 400 },
    );
  }
}
