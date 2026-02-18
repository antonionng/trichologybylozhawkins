import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";

export const dynamic = "force-dynamic";

type ConfirmKind = "video-product-hero" | "video-product-video";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });

    const body = await request.json();
    const kind = body.kind as ConfirmKind;
    const videoProductId = (body.videoProductId ?? "").trim();
    const storagePath = (body.storagePath ?? "").trim();
    const contentType = (body.contentType ?? "").trim();
    const title = (body.title ?? "").trim() || undefined;
    const sizeBytes = body.sizeBytes ?? 0;

    if (!kind || !["video-product-hero", "video-product-video"].includes(kind)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }
    if (!videoProductId) {
      return NextResponse.json({ error: "videoProductId is required" }, { status: 400 });
    }
    if (!storagePath) {
      return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
    }

    if (kind === "video-product-hero") {
      const media = await prisma.mediaAsset.create({
        data: {
          title: title ?? "Video product hero image",
          path: storagePath,
          mimeType: contentType || "image/jpeg",
          sizeBytes,
        },
      });

      await prisma.videoProduct.update({
        where: { id: videoProductId },
        data: { heroMediaId: media.id },
      });

      return NextResponse.json({ ok: true, kind, media });
    }

    const video = await prisma.videoProduct.update({
      where: { id: videoProductId },
      data: {
        videoSourceType: "UPLOAD",
        videoPath: storagePath,
        videoUrl: null,
      },
    });

    return NextResponse.json({ ok: true, kind, video });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to confirm upload" },
      { status: 400 }
    );
  }
}
