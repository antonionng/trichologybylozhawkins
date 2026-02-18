import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { setSessionCookieForUser, verifyPasswordHash } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const emailInput = String(body.email ?? "").trim();
    const emailNormalized = emailInput.toLowerCase();
    const password = String(body.password ?? "");

    if (!emailInput || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Emails are frequently treated as case-insensitive by users, but Postgres unique constraints
    // on a text field are case-sensitive. Use an insensitive lookup so legacy/mixed-case emails work.
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailInput, mode: "insensitive" } },
    });
    if (!user || !user.passwordHash) {
      // Avoid leaking which part failed; log internally for debugging.
      console.warn("[auth/login] Invalid credentials", {
        hasUser: Boolean(user),
        hasPasswordHash: Boolean(user?.passwordHash),
        emailInput,
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = verifyPasswordHash(password, user.passwordHash);
    if (!ok) {
      console.warn("[auth/login] Invalid credentials", {
        hasUser: true,
        hasPasswordHash: true,
        emailInput,
        reason: "password_mismatch",
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        // Opportunistically normalize email casing on successful login.
        ...(user.email !== emailNormalized ? { email: emailNormalized } : {}),
      },
    });

    await setSessionCookieForUser({ userId: user.id, role: user.role });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 400 }
    );
  }
}



