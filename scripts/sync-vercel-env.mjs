#!/usr/bin/env node
/**
 * Push merged .env + .env.local to Vercel (production, preview, development).
 * Uses `vercel@50.22.1` so Preview can target all branches in non-interactive mode
 * (newer CLI versions require a git branch and break automation — see vercel/vercel#15415).
 *
 * Skips values that would break cloud deploys (localhost DB/Redis/app URL).
 * Usage: from repo root, `node scripts/sync-vercel-env.mjs`
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const TARGETS = ["production", "preview", "development"];
/** Pinned CLI: preview env sync without per-branch prompts */
const VERCEL_PKG = "vercel@50.22.1";

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1).replace(/\\n/g, "\n");
    }
    out[key] = val;
  }
  return out;
}

function mergeEnv() {
  const base = parseEnvFile(join(root, ".env"));
  const local = parseEnvFile(join(root, ".env.local"));
  return { ...base, ...local };
}

function isLocalOnlyUrl(value) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value);
}

function shouldSkip(key, value) {
  if (value === undefined || value === "") return "empty";
  if (key.startsWith("VERCEL")) return "reserved (VERCEL_*)";
  if (key === "NODE_ENV") return "reserved";
  if (key === "DATABASE_URL" && isLocalOnlyUrl(value))
    return "local DATABASE_URL (set Supabase pooler URL in Vercel)";
  if (key === "DIRECT_URL" && isLocalOnlyUrl(value))
    return "local DIRECT_URL (set direct DB URL in Vercel)";
  if (key === "REDIS_URL" && isLocalOnlyUrl(value))
    return "local REDIS_URL (set Redis URL on Vercel if used)";
  if (key === "NEXT_PUBLIC_APP_URL" && isLocalOnlyUrl(value))
    return "localhost NEXT_PUBLIC_APP_URL (set https://your-domain on Vercel)";
  return null;
}

function isSensitiveKey(key) {
  if (key.startsWith("NEXT_PUBLIC_")) return false;
  return /SECRET|_KEY|TOKEN|PASSWORD|WEBHOOK|PRIVATE/i.test(key);
}

/** Vercel disallows sensitive variables on the `development` environment (vercel dev pull). */
function targetsForKey(key) {
  if (isSensitiveKey(key)) return ["production", "preview"];
  return TARGETS;
}

function vercelEnvAdd(key, target, value) {
  const args = [
    VERCEL_PKG,
    "env",
    "add",
    key,
    target,
    "--yes",
    "--force",
  ];
  if (isSensitiveKey(key)) args.push("--sensitive");
  return spawnSync("npx", args, {
    cwd: root,
    input: value,
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

const merged = mergeEnv();
const skipped = [];
const errors = [];

for (const [key, value] of Object.entries(merged)) {
  const reason = shouldSkip(key, value);
  if (reason) {
    skipped.push({ key, reason });
    continue;
  }
  for (const target of targetsForKey(key)) {
    const r = vercelEnvAdd(key, target, value);
    if (r.status !== 0) {
      errors.push({
        key,
        target,
        out: `${r.stderr || ""}${r.stdout || ""}`.slice(0, 800),
      });
    }
  }
}

const syncedKeys = Object.keys(merged).filter((k) => !shouldSkip(k, merged[k]));
console.log("Synced keys (values not shown):");
console.log(syncedKeys.length ? syncedKeys.join(", ") : "(none)");

if (skipped.length) {
  console.log("\nSkipped:");
  for (const { key, reason } of skipped) {
    console.log(`  - ${key}: ${reason}`);
  }
}

if (errors.length) {
  console.log("\nErrors:");
  for (const e of errors) {
    console.log(`  - ${e.key} [${e.target}]: ${e.out}`);
  }
  process.exit(1);
}

console.log(
  `\nDone (${VERCEL_PKG}). Sensitive → production + preview only; non-sensitive → all targets.`,
);
