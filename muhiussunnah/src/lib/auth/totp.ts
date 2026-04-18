import "server-only";
import { createHmac, randomBytes } from "crypto";

/**
 * Minimal TOTP (RFC 6238) + base32 — zero dependencies.
 * Suitable for Google Authenticator / Authy / 1Password compatibility.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return out;
}

export function base32Decode(str: string): Buffer {
  const clean = str.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const idx = BASE32_ALPHABET.indexOf(c);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Generate 8 single-use recovery codes. */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const b = randomBytes(5).toString("hex").toUpperCase();
    codes.push(`${b.slice(0, 5)}-${b.slice(5, 10)}`);
  }
  return codes;
}

/** Generate current 6-digit TOTP. `step` seconds default 30. */
export function totp(secret: string, opts?: { step?: number; digits?: number; timestamp?: number }): string {
  const step = opts?.step ?? 30;
  const digits = opts?.digits ?? 6;
  const ts = Math.floor((opts?.timestamp ?? Date.now()) / 1000 / step);

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(ts));

  const key = base32Decode(secret);
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

/** Verify code, allowing ±1 step for clock skew. */
export function verifyTotp(secret: string, code: string): boolean {
  const now = Date.now();
  for (const delta of [-30000, 0, 30000]) {
    if (totp(secret, { timestamp: now + delta }) === code) return true;
  }
  return false;
}

export function otpauthUri(args: { secret: string; label: string; issuer: string }): string {
  const params = new URLSearchParams({
    secret: args.secret,
    issuer: args.issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${encodeURIComponent(args.issuer)}:${encodeURIComponent(args.label)}?${params.toString()}`;
}
