import { NextResponse } from "next/server";
import {
  listPromptTemplates,
  upsertPromptTemplate,
} from "@/server/modules/ai/service";

export async function GET() {
  try {
    const templates = await listPromptTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list templates",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await upsertPromptTemplate(body);
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save template",
      },
      { status: 400 }
    );
  }
}

