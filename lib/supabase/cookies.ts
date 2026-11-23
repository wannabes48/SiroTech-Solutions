import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Supabase session cookie settings, shared by middleware and server code.
 *
 * Host-only (no `domain`), so a portal.* session is never sent to admin.* and
 * each subdomain keeps its own login. Never set a shared ".sirotech.co.ke" domain.
 * In production the __Host- prefix makes browsers enforce Secure + Path=/ + no Domain.
 */
const isProd = process.env.NODE_ENV === "production";

export const SUPABASE_COOKIE_OPTIONS: CookieOptionsWithName = {
  name: isProd ? "__Host-sb-auth" : "sb-auth",
  path: "/",
  sameSite: "lax",
  secure: isProd,
};

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
