import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { generationId: string } }
) {
  try {
    await requireUser({ role: "ADMIN" });
    const generation = await prisma.generatedContent.findUnique({
      where: { id: params.generationId },
    });
    return NextResponse.json(generation);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch generation" },
      { status: 400 }
    );
  }
}



