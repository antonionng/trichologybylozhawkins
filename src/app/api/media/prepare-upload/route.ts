import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { createSignedUploadUrl } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

const safeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type PrepareKind = "video-product-hero" | "video-product-video" | "quiz-hero";

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });

    const body = await request.json();
    const kind = body.kind as PrepareKind;
    const videoProductId = (body.videoProductId ?? "").trim();
    const quizId = (body.quizId ?? "").trim();
    const filename = safeFileName(body.filename ?? "upload.bin");
    const contentType = body.contentType ?? "application/octet-stream";

    if (
      !kind ||
      !["video-product-hero", "video-product-video", "quiz-hero"].includes(kind)
    ) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    if (kind === "quiz-hero") {
      if (!quizId) {
        return NextResponse.json({ error: "quizId is required" }, { status: 400 });
      }
    } else if (!videoProductId) {
      return NextResponse.json({ error: "videoProductId is required" }, { status: 400 });
    }

    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const basePath =
      kind === "quiz-hero"
        ? `quiz/${quizId}/hero`
        : kind === "video-product-hero"
          ? `videos/${videoProductId}/hero`
          : `videos/${videoProductId}/video`;

    const storagePath = `${basePath}/${stamp}-${filename}`;
    const { signedUrl, token } = await createSignedUploadUrl(storagePath);

    return NextResponse.json({
      ok: true,
      signedUrl,
      token,
      storagePath,
      contentType,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare upload" },
      { status: 400 }
    );
  }
}
