import { NextResponse } from "next/server";
import { executeTemplatePreview } from "@/server/modules/ai/service";
import { rateLimit } from "@/server/security/rateLimit";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const allowed = rateLimit({
      key: `ai-preview:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many preview requests. Try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = await executeTemplatePreview({
      templateId: body.templateId,
      prompt: body.prompt,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate preview",
      },
      { status: 400 }
    );
  }
}

