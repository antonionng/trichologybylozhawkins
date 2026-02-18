import { NextResponse } from "next/server";
import { z } from "zod";
import { AssetVariantStatus, ContentSlotStatus } from "@prisma/client";
import { updateSlotAndVariant } from "@/server/modules/contentFactory/service";
import { requireUser } from "@/server/security/auth";
import { requestPostImageGeneration } from "@/server/modules/ai/postImageGeneration";

const updateSlotSchema = z.object({
  slotId: z.string().cuid(),
  title: z.string().min(1).optional(),
  brief: z.string().optional().nullable(),
  scheduledFor: z
    .union([z.string().datetime(), z.date()])
    .optional()
    .nullable()
    .transform((value) => {
      if (value === null) return null;
      if (!value) return undefined;
      return value instanceof Date ? value : new Date(value);
    }),
  status: z.nativeEnum(ContentSlotStatus).optional(),
  variantId: z.string().cuid().optional(),
  variant: z
    .object({
      headline: z.string().optional().nullable(),
      copy: z.string().optional().nullable(),
      cta: z.string().optional().nullable(),
      // Accept either a textarea string or a list; we persist a single string (space-separated #tags).
      hashtags: z.union([z.string(), z.array(z.string())]).optional().nullable(),
      status: z.nativeEnum(AssetVariantStatus).optional(),
    })
    .optional(),
});

const normalizeHashtagsToText = (value: string | string[] | null | undefined) => {
  if (value == null) return undefined;
  const tokens = Array.isArray(value)
    ? value
    : value
        .split(/[\s,]+/g)
        .map((t) => t.trim())
        .filter(Boolean);

  const normalized = tokens
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`));

  if (!normalized.length) return "";
  return normalized.join(" ");
};

export async function PATCH(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const body = await request.json();
    const data = updateSlotSchema.parse(body);

    const slot = await updateSlotAndVariant({
      slotId: data.slotId,
      title: data.title,
      brief: data.brief,
      scheduledFor: data.scheduledFor,
      status: data.status,
      variantId: data.variantId,
      variantPatch: data.variant
        ? {
            headline: data.variant.headline ?? undefined,
            copy: data.variant.copy ?? undefined,
            cta: data.variant.cta ?? undefined,
            hashtags: normalizeHashtagsToText(data.variant.hashtags) ?? undefined,
            status: data.variant.status ?? undefined,
          }
        : undefined,
    });

    let imageGeneration: { mode: "queued" | "inline"; reason?: string } | null = null;
    if (data.status === ContentSlotStatus.APPROVED) {
      imageGeneration = await requestPostImageGeneration(data.slotId);
    }

    return NextResponse.json({ slot, imageGeneration });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update post",
      },
      { status: 400 }
    );
  }
}



