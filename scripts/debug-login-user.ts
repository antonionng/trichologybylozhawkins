import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";

function mask(value: string, keepStart = 10, keepEnd = 10) {
  if (value.length <= keepStart + keepEnd) return `${value.slice(0, keepStart)}…`;
  return `${value.slice(0, keepStart)}…${value.slice(-keepEnd)}`;
}

function loadEnvFileIfPresent(filePath: string) {
  if (!fs.existsSync(filePath)) return false;
  const raw = fs.readFileSync(filePath, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (!key) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

// Same algorithm as `src/server/security/password.ts` (Format: scrypt$N$r$p$saltB64$hashB64)
function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 6) return false;
  const [algo, nStr, rStr, pStr, saltB64, hashB64] = parts;
  if (algo !== "scrypt") return false;

  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, salt, expected.length, { N, r, p }) as Buffer;
  return timingSafeEqual(expected, actual);
}

async function main() {
  // Load .env files (Prisma CLI auto-loads env, but tsx doesn't).
  const cwd = process.cwd();
  loadEnvFileIfPresent(path.join(cwd, ".env.local"));
  loadEnvFileIfPresent(path.join(cwd, ".env"));

  const email = String(process.argv[2] ?? "").trim();
  const password = String(process.argv[3] ?? "");
  if (!email) {
    throw new Error("Usage: tsx scripts/debug-login-user.ts <email> <password>");
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, role: true, passwordHash: true, updatedAt: true },
  });

  if (!user) {
    // eslint-disable-next-line no-console
    console.log("No user found for email (insensitive):", email);
    return;
  }

  const stored = user.passwordHash ?? "";
  const parts = stored ? stored.split("$") : [];
  const algo = parts[0] ?? "";
  const partsLen = parts.length;

  // eslint-disable-next-line no-console
  console.log("User:", { id: user.id, email: user.email, role: user.role, updatedAt: user.updatedAt });
  // eslint-disable-next-line no-console
  console.log("passwordHash:", {
    present: Boolean(user.passwordHash),
    masked: stored ? mask(stored) : null,
    partsLen,
    algo,
  });

  if (password && user.passwordHash) {
    const ok = verifyPassword(password, user.passwordHash);
    // eslint-disable-next-line no-console
    console.log("verifyPassword(password, stored) =>", ok);
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => {});

