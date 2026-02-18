export type SessionClaims = {
  uid: string;
  role: "ADMIN" | "LEARNER";
  exp: number; // unix seconds
};

const textEncoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  // eslint-disable-next-line no-undef
  return btoa(binary);
};

const fromBase64 = (base64: string) => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  // eslint-disable-next-line no-undef
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const base64UrlEncode = (bytes: Uint8Array) =>
  toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const base64UrlDecode = (value: string) =>
  fromBase64(value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4));

const constantTimeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
};

const importKey = async (secret: string) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("WebCrypto unavailable: cannot verify sessions");
  }

  return globalThis.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
};

const hmacSha256 = async (secret: string, message: string) => {
  const key = await importKey(secret);
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(message)
  );
  return new Uint8Array(signature);
};

export const createSessionToken = async (claims: SessionClaims, secret: string) => {
  const payload = base64UrlEncode(textEncoder.encode(JSON.stringify(claims)));
  const sig = base64UrlEncode(await hmacSha256(secret, payload));
  return `${payload}.${sig}`;
};

export const verifySessionToken = async (token: string, secret: string) => {
  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return null;

  const expectedSig = await hmacSha256(secret, payloadPart);
  const gotSig = base64UrlDecode(sigPart);
  if (!constantTimeEqual(expectedSig, gotSig)) return null;

  let claims: SessionClaims;
  try {
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart)));
  } catch {
    return null;
  }

  if (!claims?.uid || !claims?.role || !claims?.exp) return null;
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp <= now) return null;

  return claims;
};



