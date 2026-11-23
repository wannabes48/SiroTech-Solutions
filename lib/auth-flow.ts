import { headers } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { query } from "@/lib/db";
import { areaForHost, PORTAL_URL, ADMIN_URL } from "@/lib/hosts";
import { getProfileByAuthId, linkProfileByVerifiedEmail, type ProfileRow } from "@/lib/auth-server";
import { allowedOnArea, type AccessArea } from "@/lib/access-email";
import { supabaseAdmin, hasServiceRole } from "@/lib/supabase/admin";
import { markMfaVerified } from "@/lib/mfa";

export async function currentArea(): Promise<AccessArea> {
  return areaForHost((await headers()).get("host")) === "admin" ? "admin" : "portal";
}

export async function clientIp(): Promise<string> {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
}

/** Only same-host relative paths are allowed as post-login destinations. */
export const safeNext = (n: string | null | undefined) =>
  n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/";

export const needsTwoStep = (p: ProfileRow) => (p.role === "STAFF" || p.role === "ADMIN") && Boolean(p.totp_enabled && p.totp_secret);

export type CompleteResult = {
  ok: boolean;
  redirect?: string;
  profile?: ProfileRow;
  error?: string;
  code?: "not-allowed" | "wrong-area";
};

/**
 * Run after ANY Supabase sign-in (password, link, code). Checks the profile is
 * active and allowed on this host, records the sign-in, keeps app_metadata.role
 * in sync, and decides where to go next (two-step for staff with an authenticator).
 * On failure the Supabase session is signed out again.
 */
export async function completeSignIn(
  supabase: SupabaseClient,
  user: User,
  sessionId: string | undefined,
  opts: { method: string; next?: string; totpVerified?: boolean; isInvite?: boolean }
): Promise<CompleteResult> {
  const area = await currentArea();
  let profile = await getProfileByAuthId(user.id);
  if (!profile && user.email && user.email_confirmed_at) {
    profile = await linkProfileByVerifiedEmail(user.id, user.email);
  }

  if (!profile || profile.active === false) {
    await supabase.auth.signOut();
    return { ok: false, code: "not-allowed", error: "This account can't sign in. Contact SiroTech if you think this is a mistake." };
  }
  if (!allowedOnArea(profile.role, area)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      code: "wrong-area",
      error: area === "admin" ? `This sign-in is for SiroTech staff. Clients sign in at ${PORTAL_URL}.` : `Staff accounts sign in at ${ADMIN_URL}.`,
    };
  }

  // Supabase holds the confirmed address (e.g. after an email change): keep the profile in step.
  await query(
    `UPDATE users SET accepted_at = COALESCE(accepted_at, NOW()), last_login_at = NOW(),
            email = COALESCE($2, email), updated_at = NOW()
     WHERE id = $1`,
    [profile.id, user.email_confirmed_at && user.email ? user.email.toLowerCase() : null]
  );

  // Roles come from the profile; mirror into app_metadata (server-only) for middleware routing.
  if (hasServiceRole() && (user.app_metadata as any)?.role !== profile.role) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, { app_metadata: { role: profile.role } });
    await supabase.auth.refreshSession();
  }

  try {
    await query(
      `INSERT INTO audit_logs (org_id, user_id, action, entity, entity_id, metadata, created_at)
       VALUES (COALESCE($1, (SELECT id FROM organizations ORDER BY created_at LIMIT 1)), $2, 'AUTH_LOGIN', 'USER', $2, $3, NOW())`,
      [profile.org_id, profile.id, JSON.stringify({ method: opts.method, area })]
    );
  } catch {
    // audit is best-effort
  }

  let dest = opts.isInvite ? "/welcome" : safeNext(opts.next);
  if (dest === "/" && profile.role === "CLIENT" && !profile.welcome_completed) dest = "/welcome";

  if (needsTwoStep(profile)) {
    if (opts.totpVerified && sessionId) {
      await markMfaVerified(user.id, sessionId);
    } else {
      return { ok: true, profile, redirect: `/two-step?next=${encodeURIComponent(dest)}` };
    }
  }
  return { ok: true, profile, redirect: dest };
}

/** Session id from a freshly issued access token (JWT `session_id` claim). */
export function sessionIdFromAccessToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload.session_id;
  } catch {
    return undefined;
  }
}
