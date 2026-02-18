import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/server/schema";
import { prisma } from "@/server/db/client";
import { createSessionToken, verifySessionToken } from "@/server/security/session";
import { hashPassword, verifyPassword } from "@/server/security/password";

export const SESSION_COOKIE_NAME = "lh_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export const createPasswordHash = (password: string) => hashPassword(password);
export const verifyPasswordHash = (password: string, stored: string) =>
  verifyPassword(password, stored);

export const setSessionCookieForUser = async (input: {
  userId: string;
  role: "ADMIN" | "LEARNER";
}) => {
  const env = getServerEnv();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await createSessionToken(
    { uid: input.userId, role: input.role, exp },
    env.AUTH_SECRET
  );

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = () => {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export const getCurrentSession = async () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const env = getServerEnv();
  return verifySessionToken(token, env.AUTH_SECRET);
};

export const requireUser = async (options?: { role?: "ADMIN" | "LEARNER" }) => {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (options?.role && session.role !== options.role) {
    throw new Error("Forbidden");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { session, user };
};

export const requireUserOrRedirect = async (options?: {
  role?: "ADMIN" | "LEARNER";
  next?: string;
}) => {
  try {
    return await requireUser(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    if (message === "Unauthorized") {
      const nextParam = options?.next ? `?next=${encodeURIComponent(options.next)}` : "";
      redirect(`/login${nextParam}`);
    }
    if (message === "Forbidden") {
      redirect("/academy");
    }
    throw error;
  }
};


