/**
 * Session cookie name + an Edge-safe verifier (Web Crypto) so middleware can
 * read the signed session without Node APIs. Signing lives in lib/auth-server.ts.
 *
 * The cookie is host-only (no Domain attribute), so portal.* and admin.* each
 * keep their own login: a client session can never carry into the admin.
 * Never set a shared ".sirotech.co.ke" domain on it.
 *
 * In production it uses the __Host- prefix, which browsers only accept when
 * the cookie is Secure, Path=/ and has no Domain.
 */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-sirotech_session" : "sirotech_session";

export const SESSION_SECRET =
  process.env.SESSION_SECRET || "sirotech-secure-hmac-secret-key-2026-production";

export interface SessionClaims {
  id: string;
  role: "CLIENT" | "STAFF" | "ADMIN";
  [key: string]: unknown;
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Verify the HMAC + expiry of a session cookie value. Returns the user or null. */
export async function verifySessionCookie(value: string | undefined): Promise<SessionClaims | null> {
  if (!value) return null;
  try {
    const [encoded, signature] = value.split(".");
    if (!encoded || !signature) return null;
    const raw = new TextDecoder().decode(base64UrlToBytes(encoded));

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
    if (expected.length !== signature.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    if (diff !== 0) return null;

    const parsed = JSON.parse(raw) as { user?: SessionClaims; exp?: number };
    if (!parsed.user || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed.user;
  } catch {
    return null;
  }
}
