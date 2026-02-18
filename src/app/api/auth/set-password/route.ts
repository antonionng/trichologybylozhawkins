import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { createPasswordHash, setSessionCookieForUser } from "@/server/security/auth";
import { hashToken } from "@/server/security/tokens";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || password.length < 8) {
      return NextResponse.json(
        { error: "Token and password (min 8 chars) are required" },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const authToken = await prisma.authToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!authToken || authToken.usedAt) {
      return NextResponse.json({ error: "Invalid or used token" }, { status: 401 });
    }

    if (authToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.authToken.update({
        where: { id: authToken.id },
        data: { usedAt: new Date() },
      });
      return tx.user.update({
        where: { id: authToken.userId },
        data: { passwordHash: createPasswordHash(password), lastLoginAt: new Date() },
      });
    });

    await setSessionCookieForUser({ userId: updated.id, role: updated.role });
    return NextResponse.json({ ok: true, role: updated.role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to set password" },
      { status: 400 }
    );
  }
}



