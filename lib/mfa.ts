import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Staff two-step (TOTP) marker. A Supabase session alone is not enough on the
 * admin host when the account has an authenticator: after the code is checked
 * we set this signed, host-only cookie bound to the Supabase session id, so a
 * new session (password, sign-in link or code) always needs the code again.
 */
const isProd = process.env.NODE_ENV === "production";
const COOKIE = isProd ? "__Host-sirotech_mfa" : "sirotech_mfa";
const TTL_SECONDS = 12 * 60 * 60;
const SECRET = process.env.SESSION_SECRET || "sirotech-secure-hmac-secret-key-2026-production";

const sign = (payload: string) => crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

export async function markMfaVerified(authUserId: string, sessionId: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${authUserId}.${sessionId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function isMfaVerified(authUserId: string, sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  const [uid, sid, exp, sig] = parts;
  const expected = sign(`${uid}.${sid}.${exp}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return uid === authUserId && sid === sessionId && Number(exp) > Date.now() / 1000;
}

export async function clearMfa(): Promise<void> {
  try {
    (await cookies()).set(COOKIE, "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
  } catch {
    // read-only context
  }
}
