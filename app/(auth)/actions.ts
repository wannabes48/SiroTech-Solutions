"use server";

import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAnon, hasServiceRole, supabaseAdmin } from "@/lib/supabase/admin";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  verifyPassword,
  getProfileByEmail,
  getProfileByAuthId,
  getAuthContext,
  clearSession,
} from "@/lib/auth-server";
import { allowedOnArea, ensureAuthUser, logAuthEmail, ORIGIN } from "@/lib/access-email";
import { completeSignIn, currentArea, clientIp, safeNext, needsTwoStep, sessionIdFromAccessToken } from "@/lib/auth-flow";
import { verifyTotp } from "@/lib/totp";
import { markMfaVerified } from "@/lib/mfa";
import { PORTAL_URL } from "@/lib/hosts";

// Flat (not a union): this project compiles without strictNullChecks, so unions don't narrow.
type Result = { ok: boolean; error?: string; redirect?: string; message?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINK_SENT =
  "If that email can sign in here, we've sent a sign-in link and a code. Check your inbox (and spam). The link works once and expires soon.";
const RESET_SENT = "If that email can sign in here, we've sent a password reset link. Check your inbox (and spam).";

// Per-address cooldown for public link / reset requests (silent; never reveals whether the address exists).
const lastSendByEmail = new Map<string, number>();
const linkRequests = new Map<string, { count: number; resetAt: number }>();
function linkRateLimited(ip: string): boolean {
  const now = Date.now();
  const r = linkRequests.get(ip);
  if (!r || now > r.resetAt) {
    linkRequests.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  r.count += 1;
  return r.count > 5;
}
/** Uniform response time so timing can't reveal whether an account exists. */
const settle = (startedAt: number, minMs = 1200) =>
  new Promise((r) => setTimeout(r, Math.max(0, startedAt + minMs - Date.now())));

// ─────────────────────────────────────────────────────────────────────────────
// Password sign-in (portal: clients; admin: staff + authenticator code)
// ─────────────────────────────────────────────────────────────────────────────
export async function signInWithPasswordAction(formData: FormData): Promise<Result> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const totp = String(formData.get("totp") || "").replace(/\s/g, "");
  const next = String(formData.get("next") || "/");
  if (!email || !password) return { ok: false, error: "Please provide both email and password." };

  const ip = await clientIp();
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) return { ok: false, error: `Too many failed attempts. Try again in ${limit.retryAfterMinutes} minutes.` };

  const supabase = await supabaseServer();
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // One-time move of pre-Supabase (scrypt) passwords into Supabase.
  if (error && error.code !== "email_not_confirmed" && hasServiceRole()) {
    const legacy = await getProfileByEmail(email);
    if (legacy?.password_hash && legacy.active !== false && verifyPassword(password, legacy.password_hash)) {
      const ensured = await ensureAuthUser(legacy, password);
      if ("id" in ensured) {
        ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        if (!error) await query("UPDATE users SET password_hash = NULL WHERE id = $1", [legacy.id]);
      }
    }
  }

  if (error?.code === "email_not_confirmed") {
    return { ok: false, error: "Please confirm your email first: use the link we sent, or request a sign-in link below." };
  }
  if (error || !data?.user) {
    recordFailedLogin(ip);
    return { ok: false, error: "Invalid email or password." };
  }

  // Staff with an authenticator: check the code now if given, otherwise continue to /two-step.
  let totpVerified = false;
  const profile = await getProfileByAuthId(data.user.id);
  if (profile && needsTwoStep(profile) && totp) {
    if (!verifyTotp(profile.totp_secret!, totp)) {
      await supabase.auth.signOut();
      recordFailedLogin(ip);
      return { ok: false, error: "Invalid authenticator code." };
    }
    totpVerified = true;
  }

  const done = await completeSignIn(supabase, data.user, sessionIdFromAccessToken(data.session?.access_token), {
    method: totpVerified ? "password+totp" : "password",
    next,
    totpVerified,
  });
  if (!done.ok) return { ok: false, error: done.error };
  resetLoginAttempts(ip);
  return { ok: true, redirect: done.redirect };
}

// ─────────────────────────────────────────────────────────────────────────────
// Request a sign-in link (returning staff and clients)
// Never reveals whether an email is registered; only mails users allowed on this host.
// ─────────────────────────────────────────────────────────────────────────────
export async function requestSignInLinkAction(formData: FormData): Promise<Result> {
  const startedAt = Date.now();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Enter a valid email address." };
  if (linkRateLimited(await clientIp())) {
    return { ok: false, error: "Too many requests from this connection. Please try again in a few minutes." };
  }

  const area = await currentArea();
  try {
    const last = lastSendByEmail.get(email) || 0;
    const profile = Date.now() - last < 60_000 ? null : await getProfileByEmail(email);
    if (profile && profile.active !== false && allowedOnArea(profile.role, area)) {
      lastSendByEmail.set(email, Date.now());
      if (!hasServiceRole() && !profile.auth_id) {
        await logAuthEmail({ type: "signin_link", email, userId: profile.id, area, status: "FAILED", error: "SUPABASE_SERVICE_ROLE_KEY missing" });
      } else {
        const ensured = profile.auth_id ? { id: profile.auth_id } : await ensureAuthUser(profile);
        if ("error" in ensured) {
          await logAuthEmail({ type: "signin_link", email, userId: profile.id, area, status: "FAILED", error: ensured.error });
        } else {
          const { error } = await supabaseAnon.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false, emailRedirectTo: ORIGIN[area] },
          });
          await logAuthEmail({ type: "signin_link", email, userId: profile.id, area, status: error ? "FAILED" : "SENT", error: error?.message });
          if (!error) await query("UPDATE users SET last_access_email_at = NOW() WHERE id = $1", [profile.id]);
        }
      }
    }
  } catch (err: any) {
    console.error("[requestSignInLinkAction]", err);
  }
  await settle(startedAt);
  return { ok: true, message: LINK_SENT };
}

// ─────────────────────────────────────────────────────────────────────────────
// "Enter code instead" — the short code in the sign-in / confirmation email
// ─────────────────────────────────────────────────────────────────────────────
export async function verifySignInCodeAction(formData: FormData): Promise<Result> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const code = String(formData.get("code") || "").replace(/\s/g, "");
  const next = String(formData.get("next") || "/");
  if (!EMAIL_RE.test(email) || !/^\d{6,10}$/.test(code)) {
    return { ok: false, error: "Enter your email and the code from the email." };
  }
  const ip = await clientIp();
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) return { ok: false, error: `Too many failed attempts. Try again in ${limit.retryAfterMinutes} minutes.` };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error || !data?.user) {
    recordFailedLogin(ip);
    return { ok: false, error: "That code is invalid or has expired. Request a new one." };
  }
  const done = await completeSignIn(supabase, data.user, sessionIdFromAccessToken(data.session?.access_token), {
    method: "email_code",
    next,
  });
  if (!done.ok) return { ok: false, error: done.error };
  resetLoginAttempts(ip);
  return { ok: true, redirect: done.redirect };
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff two-step (authenticator app)
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyTwoStepAction(formData: FormData): Promise<Result> {
  const code = String(formData.get("code") || "").replace(/\s/g, "");
  const next = safeNext(String(formData.get("next") || "/"));
  const ctx = await getAuthContext();
  if (!ctx) return { ok: false, error: "Your session expired. Please sign in again." };

  const ip = await clientIp();
  const limit = checkLoginRateLimit(`2fa:${ctx.authUserId}`);
  if (!limit.allowed) return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfterMinutes} minutes.` };

  const profile = await getProfileByAuthId(ctx.authUserId);
  if (!profile || !needsTwoStep(profile)) return { ok: true, redirect: next };
  if (!verifyTotp(profile.totp_secret!, code)) {
    recordFailedLogin(`2fa:${ctx.authUserId}`);
    recordFailedLogin(ip);
    return { ok: false, error: "Invalid authenticator code." };
  }
  await markMfaVerified(ctx.authUserId, ctx.sessionId!);
  resetLoginAttempts(`2fa:${ctx.authUserId}`);
  return { ok: true, redirect: next };
}

// ─────────────────────────────────────────────────────────────────────────────
// Password reset
// ─────────────────────────────────────────────────────────────────────────────
export async function forgotPasswordAction(formData: FormData): Promise<Result> {
  const startedAt = Date.now();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (linkRateLimited(await clientIp())) {
    return { ok: false, error: "Too many requests from this connection. Please try again in a few minutes." };
  }
  const area = await currentArea();
  try {
    const last = lastSendByEmail.get(`reset:${email}`) || 0;
    const profile = Date.now() - last < 60_000 ? null : await getProfileByEmail(email);
    if (profile && profile.active !== false && allowedOnArea(profile.role, area) && hasServiceRole()) {
      lastSendByEmail.set(`reset:${email}`, Date.now());
      const ensured = profile.auth_id ? { id: profile.auth_id } : await ensureAuthUser(profile);
      if ("error" in ensured) {
        await logAuthEmail({ type: "recovery", email, userId: profile.id, area, status: "FAILED", error: ensured.error });
      } else {
        const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, { redirectTo: ORIGIN[area] });
        await logAuthEmail({ type: "recovery", email, userId: profile.id, area, status: error ? "FAILED" : "SENT", error: error?.message });
      }
    }
  } catch (err) {
    console.error("[forgotPasswordAction]", err);
  }
  await settle(startedAt);
  return { ok: true, message: RESET_SENT };
}

/** Set a new password. Requires the session created by the recovery link (via /auth/confirm). */
export async function resetPasswordAction(formData: FormData): Promise<Result> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters long." };
  if (password !== confirm) return { ok: false, error: "Passwords do not match." };

  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { ok: false, error: "Your reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  await query("UPDATE users SET password_hash = NULL, updated_at = NOW() WHERE auth_id = $1", [u.user.id]);
  return { ok: true, redirect: "/" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Client sign-up (portal only)
// ─────────────────────────────────────────────────────────────────────────────
export async function signUpAction(formData: FormData): Promise<Result> {
  if ((await currentArea()) !== "portal") return { ok: false, error: "Sign-up is only available on the client portal." };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !EMAIL_RE.test(email) || !password) return { ok: false, error: "Full name, email, and password are required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters long." };
  if (linkRateLimited(await clientIp())) return { ok: false, error: "Too many requests. Please try again in a few minutes." };

  // Existing account: don't reveal it — send a sign-in link and show the same "check your email" screen.
  const existing = await getProfileByEmail(email);
  if (existing) {
    const fd = new FormData();
    fd.set("email", email);
    await requestSignInLinkAction(fd);
    return { ok: true, redirect: `/verify-email?email=${encodeURIComponent(email)}`, email };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: PORTAL_URL, data: { full_name: name } }, // metadata is display only
  });
  if (error) return { ok: false, error: error.message };
  if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
    // Supabase returns an obfuscated user when the address already exists in auth.
    return { ok: true, redirect: `/verify-email?email=${encodeURIComponent(email)}`, email };
  }
  const authUser = data.user;

  try {
    await withTransaction(async (client) => {
      const org = await client.query(
        `INSERT INTO organizations (name, billing_email, tax_pin, address, country, currency)
         VALUES ($1, $2, 'PENDING-PIN', 'Nairobi, Kenya', 'Kenya', 'KES') RETURNING id`,
        [company || `${name}'s Organization`, email]
      );
      const u = await client.query(
        `INSERT INTO users (auth_id, name, email, role, timezone, active, accepted_at)
         VALUES ($1, $2, $3, 'CLIENT', 'Africa/Nairobi', true, NULL) RETURNING id`,
        [authUser.id, name, email]
      );
      await client.query(`INSERT INTO memberships (org_id, user_id, role) VALUES ($1, $2, 'OWNER')`, [org.rows[0].id, u.rows[0].id]);
      await client.query(
        `INSERT INTO notification_preferences (user_id, email_messages, email_updates, email_invoices, email_tickets)
         VALUES ($1, true, true, true, true)`,
        [u.rows[0].id]
      );
      await client.query(
        `INSERT INTO notifications (org_id, user_id, type, title, description, target_href)
         VALUES ($1, $2, 'UPDATE', 'Welcome to SiroTech Client Portal', 'Your dedicated engineering workspace has been provisioned.', '/')`,
        [org.rows[0].id, u.rows[0].id]
      );
    });
  } catch (err) {
    console.error("[signUpAction profile]", err);
    if (hasServiceRole()) await supabaseAdmin.auth.admin.deleteUser(authUser.id);
    return { ok: false, error: "Failed to create account. Please try again." };
  }
  if (hasServiceRole()) await supabaseAdmin.auth.admin.updateUserById(authUser.id, { app_metadata: { role: "CLIENT" } });
  await logAuthEmail({ type: "signup", email, area: "portal", status: data.session ? "SKIPPED" : "SENT" });

  if (data.session) {
    // Email confirmation disabled in Supabase: already signed in.
    const done = await completeSignIn(supabase, authUser, sessionIdFromAccessToken(data.session.access_token), { method: "signup" });
    return done.ok ? { ok: true, redirect: done.redirect } : { ok: false, error: done.error };
  }
  return { ok: true, redirect: `/verify-email?email=${encodeURIComponent(email)}`, email };
}

/** Resend the sign-up confirmation (or a sign-in link for confirmed accounts). Same generic reply. */
export async function resendConfirmationAction(formData: FormData): Promise<Result> {
  const startedAt = Date.now();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (linkRateLimited(await clientIp())) return { ok: false, error: "Too many requests. Please try again in a few minutes." };
  try {
    const { error } = await supabaseAnon.auth.resend({ type: "signup", email, options: { emailRedirectTo: PORTAL_URL } });
    if (error) {
      const fd = new FormData();
      fd.set("email", email);
      await requestSignInLinkAction(fd);
    }
  } catch (err) {
    console.error("[resendConfirmationAction]", err);
  }
  await settle(startedAt);
  return { ok: true, message: LINK_SENT };
}

/** Optional password after an invite / link sign-in (welcome page) or from account settings. */
export async function setPasswordAction(formData: FormData): Promise<Result> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters long." };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, error: "Use both letters and numbers." };
  }
  const ctx = await getAuthContext();
  if (!ctx) return { ok: false, error: "Your session expired. Please sign in again." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  await query("UPDATE users SET password_hash = NULL, updated_at = NOW() WHERE auth_id = $1", [ctx.authUserId]);
  return { ok: true, message: "Password saved. You can now sign in with your email and password." };
}

export async function signOutAction() {
  await clearSession();
  redirect("/sign-in");
}
