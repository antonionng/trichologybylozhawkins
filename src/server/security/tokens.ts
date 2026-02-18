import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const generateOpaqueToken = () => randomBytes(32).toString("base64url");

export const hashToken = (token: string) =>
  createHash("sha256").update(token, "utf8").digest("hex");

export const constantTimeTokenMatch = (a: string, b: string) => {
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
};



