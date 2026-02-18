import { PrismaClient, UserRole } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Keep in sync with `src/server/security/password.ts` (Format: scrypt$N$r$p$saltB64$hashB64)
function hashPassword(password: string) {
  const salt = randomBytes(16);
  const N = 16384;
  const r = 8;
  const p = 1;
  const hash = scryptSync(password, salt, 64, { N, r, p }) as Buffer;
  return ["scrypt", String(N), String(r), String(p), salt.toString("base64"), hash.toString("base64")].join(
    "$"
  );
}

function getArg(name: string) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
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
    // strip surrounding quotes if present
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

async function main() {
  // Prisma CLI auto-loads env; this script runs via tsx so we load common env files.
  const cwd = process.cwd();
  loadEnvFileIfPresent(path.join(cwd, ".env.local"));
  loadEnvFileIfPresent(path.join(cwd, ".env"));

  const emailRaw = getArg("email") ?? process.env.SEED_USER_EMAIL ?? "";
  const password = getArg("password") ?? process.env.SEED_USER_PASSWORD ?? "";
  const roleRaw = (getArg("role") ?? process.env.SEED_USER_ROLE ?? "ADMIN").toUpperCase();

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL. Create `.env.local` (see `env.local.template`) or export DATABASE_URL before running."
    );
  }

  const email = String(emailRaw).trim().toLowerCase();
  if (!email) {
    throw new Error(
      "Missing email. Provide --email you@example.com or set SEED_USER_EMAIL."
    );
  }
  if (!password || password.length < 8) {
    throw new Error(
      "Missing/weak password. Provide --password (min 8 chars) or set SEED_USER_PASSWORD."
    );
  }

  const role: UserRole = roleRaw === "LEARNER" ? UserRole.LEARNER : UserRole.ADMIN;
  const passwordHash = hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role },
    create: { email, passwordHash, role },
    select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  // eslint-disable-next-line no-console
  console.log("✅ Seeded user:", user);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to seed user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

