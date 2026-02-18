import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/security/auth";
import { uploadToStorage } from "@/server/storage/supabase";

export const dynamic = "force-dynamic";

type UploadKind =
  | "course-hero"
  | "course-download"
  | "lesson-video"
  | "lesson-download"
  | "video-product-hero"
  | "video-product-video"
  | "workshop-hero"
  | "blog-hero";

const safeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });

    const form = await request.formData();
    const kind = String(form.get("kind") ?? "") as UploadKind;
    const courseId = String(form.get("courseId") ?? "").trim();
    const lessonId = String(form.get("lessonId") ?? "").trim();
    const videoProductId = String(form.get("videoProductId") ?? "").trim();
    const title = String(form.get("title") ?? "").trim() || undefined;

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const workshopId = String(form.get("workshopId") ?? "").trim();

    if (
      !kind ||
      ![
        "course-hero",
        "course-download",
        "lesson-video",
        "lesson-download",
        "video-product-hero",
        "video-product-video",
        "workshop-hero",
        "blog-hero",
      ].includes(kind)
    ) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const isCourseUpload =
      kind === "course-hero" ||
      kind === "course-download" ||
      kind === "lesson-video" ||
      kind === "lesson-download";
    const isVideoProductUpload = kind === "video-product-hero" || kind === "video-product-video";
    const isWorkshopUpload = kind === "workshop-hero";
    const isBlogUpload = kind === "blog-hero";

    if (isCourseUpload && !courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    if (isVideoProductUpload && !videoProductId) {
      return NextResponse.json({ error: "videoProductId is required" }, { status: 400 });
    }

    if (isWorkshopUpload && !workshopId) {
      return NextResponse.json({ error: "workshopId is required" }, { status: 400 });
    }

    if (isCourseUpload && (kind === "lesson-video" || kind === "lesson-download") && !lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";
    const filename = safeFileName(file.name || "upload.bin");
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const entryId = String(form.get("entryId") ?? "").trim();
    if (isBlogUpload && !entryId) {
      return NextResponse.json({ error: "entryId is required" }, { status: 400 });
    }

    const basePath =
      kind === "course-hero"
        ? `courses/${courseId}/hero`
        : kind === "course-download"
          ? `courses/${courseId}/downloads`
          : kind === "lesson-video" || kind === "lesson-download"
            ? `courses/${courseId}/lessons/${lessonId}`
            : kind === "video-product-hero"
              ? `videos/${videoProductId}/hero`
              : kind === "workshop-hero"
                ? `workshops/${workshopId}/hero`
                : kind === "blog-hero"
                  ? `blog/${entryId}/hero`
                  : `videos/${videoProductId}/video`;

    const path = `${basePath}/${stamp}-${filename}`;
    await uploadToStorage({ path, bytes, contentType });

    if (kind === "workshop-hero") {
      const media = await prisma.mediaAsset.create({
        data: {
          title: title ?? "Workshop hero image",
          path,
          mimeType: contentType,
          sizeBytes: bytes.length,
        },
      });

      await prisma.workshop.update({
        where: { id: workshopId },
        data: { heroMediaId: media.id },
      });

      return NextResponse.json({ ok: true, kind, media });
    }

    if (kind === "blog-hero") {
      const media = await prisma.mediaAsset.create({
        data: {
          title: title ?? "Blog hero image",
          path,
          mimeType: contentType,
          sizeBytes: bytes.length,
        },
      });

      await prisma.entryMedia.create({
        data: {
          entryId,
          mediaId: media.id,
          fieldKey: "hero",
        },
      });

      return NextResponse.json({ ok: true, kind, media });
    }

    if (kind === "course-hero") {
      const media = await prisma.mediaAsset.create({
        data: {
          title: title ?? "Course hero image",
          path,
          mimeType: contentType,
          sizeBytes: bytes.length,
        },
      });

      await prisma.course.update({
        where: { id: courseId },
        data: { heroMediaId: media.id },
      });

      return NextResponse.json({ ok: true, kind, media });
    }

    if (kind === "course-download") {
      const asset = await prisma.downloadableAsset.create({
        data: {
          courseId,
          title: title ?? file.name ?? "Download",
          filePath: path,
          mimeType: contentType,
        },
      });

      return NextResponse.json({ ok: true, kind, asset });
    }

    if (kind === "lesson-video") {
      const lesson = await prisma.courseLesson.update({
        where: { id: lessonId },
        data: { videoUrl: path },
      });

      return NextResponse.json({ ok: true, kind, lesson });
    }

    if (kind === "video-product-hero") {
      const media = await prisma.mediaAsset.create({
        data: {
          title: title ?? "Video product hero image",
          path,
          mimeType: contentType,
          sizeBytes: bytes.length,
        },
      });

      await prisma.videoProduct.update({
        where: { id: videoProductId },
        data: { heroMediaId: media.id },
      });

      return NextResponse.json({ ok: true, kind, media });
    }

    if (kind === "video-product-video") {
      const video = await prisma.videoProduct.update({
        where: { id: videoProductId },
        data: {
          videoSourceType: "UPLOAD",
          videoPath: path,
          videoUrl: null,
        },
      });

      return NextResponse.json({ ok: true, kind, video });
    }

    // lesson-download
    const asset = await prisma.downloadableAsset.create({
      data: {
        courseId,
        title: title ?? file.name ?? "Lesson download",
        filePath: path,
        mimeType: contentType,
      },
    });

    const lesson = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: { downloadableId: asset.id },
    });

    return NextResponse.json({ ok: true, kind, lesson, asset });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}


