import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Format: scrypt$N$r$p$saltB64$hashB64
export const hashPassword = (password: string) => {
  const salt = randomBytes(16);
  const N = 16384;
  const r = 8;
  const p = 1;
  const hash = scryptSync(password, salt, 64, { N, r, p }) as Buffer;
  return [
    "scrypt",
    String(N),
    String(r),
    String(p),
    salt.toString("base64"),
    hash.toString("base64"),
  ].join("$");
};

export const verifyPassword = (password: string, stored: string) => {
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
};



