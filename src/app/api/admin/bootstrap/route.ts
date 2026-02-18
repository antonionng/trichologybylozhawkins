import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { createPasswordHash } from "@/server/security/auth";
import { getServerEnv } from "@/server/schema";

export async function POST(request: Request) {
  try {
    const env = getServerEnv();
    const bootstrapToken = env.ADMIN_BOOTSTRAP_TOKEN;
    if (!bootstrapToken) {
      return NextResponse.json(
        { error: "Bootstrap is disabled (ADMIN_BOOTSTRAP_TOKEN not set)." },
        { status: 403 }
      );
    }

    const provided = request.headers.get("x-bootstrap-token") ?? "";
    if (provided !== bootstrapToken) {
      return NextResponse.json({ error: "Invalid bootstrap token" }, { status: 403 });
    }

    const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (existingAdmins > 0) {
      return NextResponse.json(
        { error: "Admin already exists. Bootstrap is no longer available." },
        { status: 409 }
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 chars) are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: createPasswordHash(password),
        role: "ADMIN",
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bootstrap failed" },
      { status: 400 }
    );
  }
}



