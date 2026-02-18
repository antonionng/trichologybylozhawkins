import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { createPasswordHash, setSessionCookieForUser } from "@/server/security/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();

    if (!email || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (min 8 characters) are required" },
        { status: 400 }
      );
    }

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName,
        lastName: lastName || firstName,
        source: "signup",
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: createPasswordHash(password),
        role: "LEARNER",
        contactId: contact.id,
        lastLoginAt: new Date(),
      },
    });

    await setSessionCookieForUser({ userId: user.id, role: user.role });

    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    console.error("[auth/signup] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 400 }
    );
  }
}
