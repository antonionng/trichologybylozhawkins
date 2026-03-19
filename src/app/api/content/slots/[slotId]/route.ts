import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

type Params = {
  params: Promise<{ slotId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser({ role: "ADMIN" });
    const { slotId } = await params;

    const slot = await prisma.contentSlot.findUnique({
      where: { id: slotId },
      include: {
        plan: true,
        assets: {
          orderBy: { createdAt: "desc" },
          include: {
            variants: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      slot: {
        ...slot,
        scheduledFor: slot.scheduledFor?.toISOString() ?? null,
        publishWindowEnd: slot.publishWindowEnd?.toISOString() ?? null,
        publishedAt: slot.publishedAt?.toISOString() ?? null,
        createdAt: slot.createdAt.toISOString(),
        updatedAt: slot.updatedAt.toISOString(),
        assets: slot.assets.map((asset) => ({
          ...asset,
          createdAt: asset.createdAt.toISOString(),
          updatedAt: asset.updatedAt.toISOString(),
          variants: asset.variants.map((variant) => ({
            ...variant,
            createdAt: variant.createdAt.toISOString(),
            updatedAt: variant.updatedAt.toISOString(),
          })),
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load post",
      },
      { status: 400 }
    );
  }
}



