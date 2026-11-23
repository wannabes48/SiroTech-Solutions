import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { areaForHost, PORTAL_URL, ADMIN_URL } from "@/lib/hosts";
import { SUPABASE_ANON_KEY, SUPABASE_COOKIE_OPTIONS, SUPABASE_URL } from "@/lib/supabase/cookies";

/**
 * Host routing:
 *   sirotech.co.ke         → marketing site only. /portal/*, /admin/* and auth pages redirect to their subdomain.
 *   portal.sirotech.co.ke  → rewritten into app/portal/** (clients only)
 *   admin.sirotech.co.ke   → rewritten into app/admin/**  (staff only)
 * Auth pages (app/(auth)) are shared and stay at the root on both subdomains.
 * /api/* is not matched, so it is served identically on every host.
 *
 * Sessions are Supabase Auth cookies (host-only, so each subdomain has its own
 * login). This middleware refreshes them and routes by the server-set
 * app_metadata.role; pages/actions re-check the profile in the database.
 */

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email", "/invite", "/auth", "/two-step"];
/** Signed-in users are sent home from these (the rest must work with a session). */
const SIGNED_OUT_ONLY = ["/sign-in", "/sign-up", "/forgot-password", "/verify-email"];
/** Client-only auth pages; the admin host has no sign-up. */
const PORTAL_ONLY_AUTH_PATHS = ["/sign-up", "/verify-email"];

const under = (p: string, base: string) => p === base || p.startsWith(base + "/");
const isAuthPath = (p: string) => AUTH_PATHS.some((a) => under(p, a));

const CSP_REPORT_ONLY = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://*.pooler.supabase.com https://api.anthropic.com;
  frame-src 'self' https://app.cal.com https://cal.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, " ").trim();

function secure(res: NextResponse, pathname: string): NextResponse {
  // Security Headers (J8 Security Checklist & Production Configuration)
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  // Subdomains are never indexed
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (under(pathname, "/auth/confirm")) {
    // The one-time token is in the URL: never cache it or leak it via Referer.
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("Referrer-Policy", "no-referrer");
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const area = areaForHost(req.headers.get("host"));
  const { pathname, search } = req.nextUrl;

  // 1. Main site: never serve portal/admin/auth pages here
  if (area === "site") {
    if (under(pathname, "/portal")) return NextResponse.redirect(`${PORTAL_URL}${pathname.slice(7) || "/"}${search}`);
    if (under(pathname, "/admin")) return NextResponse.redirect(`${ADMIN_URL}${pathname.slice(6) || "/"}${search}`);
    if (isAuthPath(pathname)) return NextResponse.redirect(`${PORTAL_URL}${pathname}${search}`);
    return NextResponse.next();
  }

  // 2. Subdomains: the folder prefix is internal only (also catches old /portal/... links)
  if (under(pathname, `/${area}`)) {
    return NextResponse.redirect(new URL(`${pathname.slice(area.length + 1) || "/"}${search}`, req.url));
  }
  if (area === "admin" && PORTAL_ONLY_AUTH_PATHS.some((a) => under(pathname, a))) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 3. Refresh the Supabase session; refreshed cookies are copied onto whatever we return.
  const cookieJar = NextResponse.next({ request: req });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: SUPABASE_COOKIE_OPTIONS,
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        list.forEach(({ name, value, options }) => cookieJar.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, any> | undefined;
  const signedIn = Boolean(claims?.sub);
  const role: string | undefined = claims?.app_metadata?.role;

  const withCookies = (res: NextResponse) => {
    cookieJar.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };
  const go = (url: string | URL) => withCookies(NextResponse.redirect(url));

  // 4. Auth gates (the profile's role/active status is re-checked server-side)
  const authPath = isAuthPath(pathname);
  if (!signedIn && !authPath) {
    return go(new URL(`/sign-in?next=${encodeURIComponent(pathname + search)}`, req.url));
  }
  if (signedIn && role === "CLIENT" && area === "admin") return go(PORTAL_URL);
  if (signedIn && role && role !== "CLIENT" && area === "portal") return go(ADMIN_URL);
  // Only bounce provisioned sessions (role set) and never when showing an auth error,
  // so a session without a usable profile can't loop between /sign-in and /.
  if (signedIn && role && !req.nextUrl.searchParams.has("error") && SIGNED_OUT_ONLY.some((a) => under(pathname, a))) {
    return go(new URL("/", req.url));
  }

  // 5. Rewrite into the area's folder (auth pages are shared and stay at the root)
  const res = authPath
    ? cookieJar
    : withCookies(NextResponse.rewrite(new URL(`/${area}${pathname === "/" ? "" : pathname}${search}`, req.url), { request: req }));
  return secure(res, pathname);
}

export const config = {
  // Everything except API routes, Next internals, robots/sitemap and static files (any path with a dot).
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
