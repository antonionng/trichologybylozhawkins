import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { videoId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireUser();

    const note = await prisma.videoNote.findUnique({
      where: {
        userId_videoProductId: {
          userId: user.id,
          videoProductId: params.videoId,
        },
      },
      select: { content: true, updatedAt: true },
    });

    return NextResponse.json({
      content: note?.content ?? "",
      updatedAt: note?.updatedAt ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const putSchema = z.object({
  content: z.string().max(50000),
});

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { user } = await requireUser();
    const body = await request.json();
    const { content } = putSchema.parse(body);

    const note = await prisma.videoNote.upsert({
      where: {
        userId_videoProductId: {
          userId: user.id,
          videoProductId: params.videoId,
        },
      },
      create: {
        userId: user.id,
        videoProductId: params.videoId,
        content,
      },
      update: { content },
      select: { content: true, updatedAt: true },
    });

    return NextResponse.json({
      content: note.content,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
