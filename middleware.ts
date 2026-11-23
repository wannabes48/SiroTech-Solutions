import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { areaForHost, PORTAL_URL, ADMIN_URL } from "@/lib/hosts";
import { SESSION_COOKIE, verifySessionCookie } from "@/lib/session-cookie";

/**
 * Host routing:
 *   sirotech.co.ke         → marketing site only. /portal/*, /admin/* and auth pages redirect to their subdomain.
 *   portal.sirotech.co.ke  → rewritten into app/portal/** (clients only)
 *   admin.sirotech.co.ke   → rewritten into app/admin/**  (staff only)
 * Auth pages (app/(auth)) are shared and stay at the root on both subdomains.
 * /api/* is not matched, so it is served identically on every host.
 */

const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email", "/invite"];
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

function secure(res: NextResponse): NextResponse {
  // Security Headers (J8 Security Checklist & Production Configuration)
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  // Subdomains are never indexed
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
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

  // 3. Auth gates (signature + expiry verified; host-only cookie, so each subdomain has its own session)
  const user = await verifySessionCookie(req.cookies.get(SESSION_COOKIE)?.value);
  const authPath = isAuthPath(pathname);

  if (!user && !authPath) {
    return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(pathname + search)}`, req.url));
  }
  if (user && area === "admin" && user.role === "CLIENT") return NextResponse.redirect(PORTAL_URL);
  if (user && area === "portal" && user.role !== "CLIENT") return NextResponse.redirect(ADMIN_URL);
  if (user && authPath) return NextResponse.redirect(new URL("/", req.url));

  // 4. Rewrite into the area's folder (auth pages are shared and stay at the root)
  const res = authPath
    ? NextResponse.next()
    : NextResponse.rewrite(new URL(`/${area}${pathname === "/" ? "" : pathname}${search}`, req.url));
  return secure(res);
}

export const config = {
  // Everything except API routes, Next internals, robots/sitemap and static files (any path with a dot).
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
