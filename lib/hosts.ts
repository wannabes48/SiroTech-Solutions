/**
 * Host + path helpers for the subdomain split.
 *
 *   sirotech.co.ke          → marketing site  (app/(marketing))
 *   portal.sirotech.co.ke   → client portal   (app/portal/**, rewritten by middleware)
 *   admin.sirotech.co.ke    → admin console   (app/admin/**, rewritten by middleware)
 *
 * Safe to import from middleware (Edge), server code and client components.
 *
 * Env:
 *   NEXT_PUBLIC_ROOT_DOMAIN   sirotech.co.ke | staging.sirotech.co.ke | localhost:3000 (dev)
 *   NEXT_PUBLIC_PORTAL_URL    optional override, defaults to <proto>://portal.<root>
 *   NEXT_PUBLIC_ADMIN_URL     optional override, defaults to <proto>://admin.<root>
 */

export type Area = "site" | "portal" | "admin";

const trimSlash = (u: string) => u.replace(/\/+$/, "");

/** e.g. "sirotech.co.ke", "staging.sirotech.co.ke" or "localhost:3000". */
export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "sirotech.co.ke").toLowerCase();
const ROOT_HOSTNAME = ROOT_DOMAIN.split(":")[0];
const IS_LOCAL_ROOT = ROOT_HOSTNAME === "localhost" || ROOT_HOSTNAME.endsWith(".localhost");
const PROTOCOL = IS_LOCAL_ROOT ? "http" : "https";

export const MAIN_URL = `${PROTOCOL}://${ROOT_DOMAIN}`;
export const PORTAL_URL = trimSlash(process.env.NEXT_PUBLIC_PORTAL_URL || `${PROTOCOL}://portal.${ROOT_DOMAIN}`);
export const ADMIN_URL = trimSlash(process.env.NEXT_PUBLIC_ADMIN_URL || `${PROTOCOL}://admin.${ROOT_DOMAIN}`);

/**
 * Which area a Host header belongs to. Port and a leading "www." are ignored.
 * portal.localhost / admin.localhost are always recognised outside production builds.
 */
export function areaForHost(host: string | null | undefined): Area {
  const h = (host ?? "").toLowerCase().split(":")[0].replace(/^www\./, "");
  const allowLocal = IS_LOCAL_ROOT || process.env.NODE_ENV !== "production";
  if (h === `admin.${ROOT_HOSTNAME}` || (allowLocal && h === "admin.localhost")) return "admin";
  if (h === `portal.${ROOT_HOSTNAME}` || (allowLocal && h === "portal.localhost")) return "portal";
  return "site";
}

/**
 * Public path prefix for each area. Both subdomains serve their folder at "/",
 * so links are "/projects/123", not "/portal/projects/123".
 * To move an area back under a path on the main host, change its prefix here
 * (and its *_URL above).
 */
const PUBLIC_PREFIX: Record<"portal" | "admin", string> = { portal: "", admin: "" };

function toPublic(area: "portal" | "admin", path = "/"): string {
  let p = path.startsWith("/") || path.startsWith("?") || path.startsWith("#") ? path : `/${path}`;
  // Accept legacy internal paths ("/portal/x") so hrefs already stored in the DB keep working.
  const internal = `/${area}`;
  if (p === internal || p.startsWith(`${internal}/`) || p.startsWith(`${internal}?`) || p.startsWith(`${internal}#`)) {
    p = p.slice(internal.length);
  }
  if (!p.startsWith("/")) p = `/${p}`;
  const prefix = PUBLIC_PREFIX[area];
  if (!prefix) return p;
  return p === "/" ? prefix : p.startsWith("/?") || p.startsWith("/#") ? `${prefix}${p.slice(1)}` : `${prefix}${p}`;
}

/** Public path inside the client portal: portalPath("/projects/1") → "/projects/1". */
export const portalPath = (path?: string) => toPublic("portal", path);
/** Public path inside the admin console: adminPath("/leads") → "/leads". */
export const adminPath = (path?: string) => toPublic("admin", path);

/** Absolute URLs, for emails, payment callbacks and cross-host links. */
export const portalUrl = (path?: string) => `${PORTAL_URL}${portalPath(path)}`;
export const adminUrl = (path?: string) => `${ADMIN_URL}${adminPath(path)}`;
export const mainUrl = (path = "/") => `${MAIN_URL}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
