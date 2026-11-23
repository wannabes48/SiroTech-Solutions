import { SessionUser } from "./auth-server";
import { adminPath } from "./hosts";

export type StaffRole = "ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT" | "FINANCE";

export interface StaffSessionUser extends SessionUser {
  staffRole: StaffRole;
  totpEnabled: boolean;
}

// ==========================================
// 1. Role-to-Permissions Mapping
// ==========================================
export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  ADMIN: [
    "leads:read", "leads:write", "leads:convert",
    "consultations:read", "consultations:write",
    "clients:read", "clients:write",
    "projects:read", "projects:write",
    "invoices:read", "invoices:write", "invoices:refund", "invoices:void",
    "payments:read", "payments:write",
    "tickets:read", "tickets:write",
    "messages:read", "messages:write",
    "content:read", "content:write", "content:publish",
    "blog:read", "blog:write", "blog:publish",
    "media:read", "media:write",
    "careers:read", "careers:write",
    "nav:read", "nav:write",
    "seo:read", "seo:write",
    "redirects:read", "redirects:write",
    "assistant:read", "assistant:write",
    "reports:read", "reports:export",
    "users:read", "users:manage",
    "settings:read", "settings:manage",
    "system:read", "system:manage",
    "audit:read", "privacy:manage"
  ],
  FINANCE: [
    "clients:read",
    "invoices:read", "invoices:write", "invoices:refund", "invoices:void",
    "payments:read", "payments:write",
    "reports:read", "reports:export",
    "audit:read"
  ],
  MANAGER: [
    "leads:read", "leads:write", "leads:convert",
    "consultations:read", "consultations:write",
    "clients:read", "clients:write",
    "projects:read", "projects:write",
    "invoices:read", "invoices:write", "invoices:refund", "invoices:void",
    "payments:read", "payments:write",
    "tickets:read", "tickets:write",
    "messages:read", "messages:write",
    "content:read", // Read-only on content
    "blog:read",
    "careers:read", "careers:write",
    "assistant:read",
    "reports:read", "reports:export"
  ],
  EDITOR: [
    "leads:read", // Read-only on leads
    "content:read", "content:write", "content:publish",
    "blog:read", "blog:write", "blog:publish",
    "media:read", "media:write",
    "careers:read", "careers:write",
    "nav:read", "nav:write",
    "seo:read", "seo:write",
    "redirects:read", "redirects:write",
    "assistant:read",
    "reports:read" // Content analytics only
  ],
  SUPPORT: [
    "leads:read", "leads:write",
    "consultations:read", "consultations:write",
    "clients:read", // Read-only
    "projects:read", // Read-only
    "tickets:read", "tickets:write",
    "messages:read", "messages:write",
    "reports:read" // Support performance only
  ]
};

export function hasPermission(role: StaffRole, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

// Map route prefixes to required permissions
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/admin/leads": "leads:read",
  "/admin/consultations": "consultations:read",
  "/admin/clients": "clients:read",
  "/admin/projects": "projects:read",
  "/admin/invoices": "invoices:read",
  "/admin/recurring": "invoices:read",
  "/admin/payments": "payments:read",
  "/admin/support": "tickets:read",
  "/admin/messages": "messages:read",
  "/admin/home": "content:read",
  "/admin/pages": "content:read",
  "/admin/services": "content:read",
  "/admin/solutions": "content:read",
  "/admin/industries": "content:read",
  "/admin/work": "content:read",
  "/admin/blog": "blog:read",
  "/admin/testimonials": "content:read",
  "/admin/team": "content:read",
  "/admin/faq": "content:read",
  "/admin/pricing": "content:read",
  "/admin/careers": "careers:read",
  "/admin/applications": "careers:read",
  "/admin/media": "media:read",
  "/admin/navigation": "nav:read",
  "/admin/seo": "seo:read",
  "/admin/redirects": "redirects:read",
  "/admin/settings": "settings:read",
  "/admin/assistant": "assistant:read",
  "/admin/analytics": "reports:read",
  "/admin/reports": "reports:read",
  "/admin/users": "users:read",
  "/admin/audit": "audit:read",
  "/admin/integrations": "system:read",
  "/admin/email": "system:read",
  "/admin/privacy": "privacy:manage",
  "/admin/health": "system:read",
  "/admin/backups": "system:read"
};

export function canAccessRoute(role: StaffRole, path: string): boolean {
  for (const [prefix, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    // Keys are internal folder paths; `path` is the public (subdomain) pathname.
    if (path.startsWith(adminPath(prefix))) {
      return hasPermission(role, permission);
    }
  }
  return true; // Root overview or tasks accessible to all staff
}
