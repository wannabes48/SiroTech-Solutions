import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Re-authentication for sensitive staff changes (invite, change permissions,
 * disable, force sign-out, reset two-step). After the owner re-enters their
 * authenticator code or password, this signed, host-only cookie bound to their
 * Supabase session is valid for a few minutes.
 */
const isProd = process.env.NODE_ENV === "production";
const COOKIE = isProd ? "__Host-sirotech_reauth" : "sirotech_reauth";
export const REAUTH_TTL_SECONDS = 10 * 60;
const SECRET = process.env.SESSION_SECRET || "sirotech-secure-hmac-secret-key-2026-production";

const sign = (payload: string) => crypto.createHmac("sha256", `reauth:${SECRET}`).update(payload).digest("hex");

export async function markReauthenticated(authUserId: string, sessionId: string | undefined): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + REAUTH_TTL_SECONDS;
  const payload = `${authUserId}.${sessionId || "nosession"}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: REAUTH_TTL_SECONDS,
  });
}

export async function isRecentlyReauthenticated(authUserId: string, sessionId: string | undefined): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  const [uid, sid, exp, sig] = parts;
  const expected = sign(`${uid}.${sid}.${exp}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return uid === authUserId && sid === (sessionId || "nosession") && Number(exp) > Date.now() / 1000;
}

/** Error shape the staff screen recognises: it asks for the code/password and retries. */
export const REAUTH_REQUIRED = { error: "Confirm it's you to make this change.", reauthRequired: true as const };
