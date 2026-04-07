import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { getServerEnv } from "@/server/schema";
import { requireUser } from "@/server/security/auth";
import { generateOpaqueToken, hashToken } from "@/server/security/tokens";
import { sendAdminInviteEmail } from "@/server/modules/email/transactional";

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

export const dynamic = "force-dynamic";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { user: inviter } = await requireUser({ role: "ADMIN" });

    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(String(body.email ?? ""));
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (email === inviter.email.toLowerCase()) {
      return NextResponse.json({ error: "You are already signed in with this email." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (existing && existing.role === "LEARNER") {
      return NextResponse.json(
        {
          error:
            "This email is already registered as a learner. Use a different address or change the account in the database.",
        },
        { status: 409 },
      );
    }

    const rawToken = generateOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    await prisma.$transaction(async (tx) => {
      let userId: string;
      if (!existing) {
        const created = await tx.user.create({
          data: { email, role: "ADMIN" },
        });
        userId = created.id;
      } else {
        userId = existing.id;
      }

      await tx.authToken.deleteMany({
        where: { userId, type: "INVITE", usedAt: null },
      });

      await tx.authToken.create({
        data: {
          userId,
          type: "INVITE",
          tokenHash,
          expiresAt,
        },
      });
    });

    const appUrl = getServerEnv().NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const setPasswordUrl = `${appUrl.replace(/\/$/, "")}/set-password?token=${encodeURIComponent(rawToken)}&next=${encodeURIComponent("/dashboard")}`;

    const sent = await sendAdminInviteEmail({
      to: email,
      appUrl: appUrl.replace(/\/$/, ""),
      setPasswordUrl,
    });

    if (sent.skipped) {
      return NextResponse.json(
        {
          error:
            "Invite was created but email could not be sent. Set RESEND_API_KEY and RESEND_FROM_EMAIL, then send the invite again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "This email was just created by another request. Try sending the invite again." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send invite" },
      { status: 400 },
    );
  }
}
