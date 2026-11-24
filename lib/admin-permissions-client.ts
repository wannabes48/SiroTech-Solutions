import { SessionUser } from "./auth-server";
import { adminPath } from "./hosts";

/**
 * Staff permissions: named actions ("invoices:send", "payments:refund") granted
 * through a preset plus per-person overrides. Pure functions only: this file is
 * imported by client components to hide buttons, but the server decides —
 * every page and action calls requireStaffUser("area:action").
 */

/** Legacy users.staff_role values (kept for display and for accounts not yet given a preset). */
export type StaffRole = "ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT" | "FINANCE";

export type PresetKey = "admin" | "client_manager" | "delivery_lead" | "finance" | "editor" | "support";

export interface StaffSessionUser extends SessionUser {
  /** Legacy column value, display only. Never authorise from it. */
  staffRole: string;
  preset: PresetKey;
  /** Per-person overrides: "perm" adds, "!perm" removes (deny wins). */
  overrides: string[];
  /** Owners (admin preset) can do everything; only they can manage staff, refund or void. */
  isOwner: boolean;
  totpEnabled: boolean;
}

/** The fields can() needs; safe to send to the browser. */
export type PermissionSubject = Pick<StaffSessionUser, "preset" | "overrides" | "isOwner">;

// ==========================================
// 1. Permission catalog
// ==========================================
export const PERMISSION_CATALOG: { group: string; perms: { key: string; label: string }[] }[] = [
  { group: "Overview", perms: [
    { key: "dashboard:read", label: "Overview and tasks" },
    { key: "reports:read", label: "Reports page (each export needs its own permission)" },
    { key: "analytics:read", label: "Site analytics (Google Analytics)" },
  ] },
  { group: "Leads", perms: [
    { key: "leads:read", label: "View leads" },
    { key: "leads:write", label: "Edit leads, notes, replies" },
    { key: "leads:assign", label: "Assign leads" },
    { key: "leads:convert", label: "Convert a lead to a client" },
    { key: "leads:export", label: "Export leads (audited)" },
    { key: "leads:delete", label: "Delete leads" },
  ] },
  { group: "Consultations", perms: [
    { key: "consultations:read", label: "View consultations" },
    { key: "consultations:write", label: "Book and update consultations" },
  ] },
  { group: "Clients", perms: [
    { key: "clients:read", label: "View client organisations and users" },
    { key: "clients:write", label: "Edit organisations and client users" },
    { key: "clients:invite", label: "Invite client users" },
    { key: "clients:export", label: "Export clients (audited)" },
    { key: "clients:archive", label: "Deactivate or delete organisations" },
    { key: "clients:impersonate", label: "View the portal as a client" },
    { key: "clients:internal", label: "Private account notes" },
  ] },
  { group: "Projects", perms: [
    { key: "projects:read", label: "View projects" },
    { key: "projects:create", label: "Create a project request" },
    { key: "projects:write", label: "Scope projects: status, dates, details" },
    { key: "milestones:write", label: "Add and update milestones" },
    { key: "updates:post", label: "Post project updates" },
    { key: "projects:internal", label: "Private delivery notes" },
  ] },
  { group: "Files", perms: [
    { key: "files:read", label: "View project files" },
    { key: "files:write", label: "Upload files" },
    { key: "files:delete", label: "Delete files" },
  ] },
  { group: "Proposals", perms: [
    { key: "proposals:write", label: "Create proposals" },
    { key: "proposals:send", label: "Send proposals to clients" },
  ] },
  { group: "Messages", perms: [
    { key: "messages:read", label: "Read client messages" },
    { key: "messages:write", label: "Reply to client messages" },
  ] },
  { group: "Invoices", perms: [
    { key: "invoices:read", label: "View invoices" },
    { key: "invoices:write", label: "Create and edit invoices" },
    { key: "invoices:send", label: "Send invoices and payment links" },
    { key: "invoices:markpaid", label: "Mark invoices paid manually (you are alerted)" },
    { key: "invoices:void", label: "Void invoices" },
  ] },
  { group: "Payments", perms: [
    { key: "payments:read", label: "View payments" },
    { key: "payments:export", label: "Export payments and revenue (audited)" },
    { key: "payments:refund", label: "Refund payments" },
    { key: "recurring:write", label: "Manage recurring plans" },
    { key: "plans:write", label: "Edit pricing plans" },
  ] },
  { group: "Support", perms: [
    { key: "tickets:read", label: "View tickets" },
    { key: "tickets:write", label: "Reply to tickets, internal notes" },
    { key: "tickets:assign", label: "Reassign tickets" },
    { key: "tickets:close", label: "Close tickets" },
    { key: "canned:write", label: "Manage canned replies" },
  ] },
  { group: "Marketing", perms: [
    { key: "subscribers:read", label: "View subscribers" },
    { key: "subscribers:export", label: "Export subscribers" },
    { key: "campaigns:read", label: "View campaigns" },
    { key: "campaigns:write", label: "Edit campaigns" },
    { key: "campaigns:send", label: "Send campaigns" },
  ] },
  { group: "Careers", perms: [
    { key: "careers:read", label: "View job posts" },
    { key: "careers:write", label: "Edit job posts" },
    { key: "applications:read", label: "View applications" },
    { key: "applications:write", label: "Update applications" },
  ] },
  { group: "Content", perms: [
    { key: "content:read", label: "View site content" },
    { key: "content:write", label: "Save drafts" },
    { key: "content:publish", label: "Publish, unpublish, archive" },
    { key: "content:delete", label: "Delete content and media" },
    { key: "media:write", label: "Upload media" },
    { key: "seo:write", label: "SEO metadata and redirects" },
    { key: "navigation:write", label: "Navigation menus" },
  ] },
  { group: "Site and system", perms: [
    { key: "settings:read", label: "View site settings" },
    { key: "settings:write", label: "Change site settings and feature flags" },
    { key: "assistant:read", label: "View the AI assistant" },
    { key: "assistant:write", label: "Configure the AI assistant" },
    { key: "integrations:read", label: "View integrations" },
    { key: "integrations:write", label: "Configure integrations, replay webhooks" },
    { key: "emails:write", label: "Email templates and logs" },
    { key: "maintenance:write", label: "Maintenance mode" },
    { key: "jobs:run", label: "Run background jobs" },
    { key: "health:read", label: "Health and telemetry" },
    { key: "backups:export", label: "Backups and full data exports" },
    { key: "privacy:write", label: "Privacy and GDPR requests" },
    { key: "audit:read", label: "Audit log" },
    { key: "staff:read", label: "View staff accounts" },
    { key: "staff:write", label: "Invite staff, change permissions" },
  ] },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_CATALOG.flatMap((g) => g.perms.map((p) => p.key));
const AREAS = new Set(ALL_PERMISSIONS.map((p) => p.split(":")[0]));

// ==========================================
// 2. Presets
// ==========================================
type Preset = { label: string; description: string; allow: string[]; deny?: string[] };

export const PRESETS: Record<PresetKey, Preset> = {
  admin: { label: "Admin (owner)", description: "Everything, including staff, refunds and voids.", allow: ["*"] },

  client_manager: {
    label: "Client manager",
    description: "Owns leads, clients, proposals, invoices and billing follow-up. Projects read-only; can request a project when a deal is won.",
    allow: [
      "dashboard:read", "reports:read",
      "leads:read", "leads:write", "leads:assign", "leads:convert", "leads:export",
      "consultations:*",
      "clients:read", "clients:write", "clients:invite", "clients:export", "clients:internal",
      "projects:read", "projects:create",
      "files:read",
      "proposals:write", "proposals:send",
      "messages:read", "messages:write",
      "invoices:read", "invoices:write", "invoices:send", "invoices:markpaid",
      "payments:read", "payments:export", "recurring:write",
      "tickets:read", "tickets:write", "tickets:assign", "tickets:close", "canned:write",
      "subscribers:read", "campaigns:read",
      "content:read", "content:write", "media:write", // drafts only: no content:publish
    ],
    deny: [
      "invoices:void", "payments:refund", "plans:write",
      "projects:write", "milestones:write", "updates:post", "projects:internal",
      "clients:impersonate", "clients:archive", "leads:delete",
      "content:publish", "content:delete", "seo:write", "navigation:write",
      "settings:*", "assistant:*", "integrations:*", "emails:*", "maintenance:*", "jobs:*", "backups:*",
      "audit:*", "staff:*", "health:*", "privacy:*", "analytics:*",
    ],
  },

  delivery_lead: {
    label: "Delivery lead",
    description: "Runs projects, milestones, updates and files. Read-only on invoices; no payments.",
    allow: [
      "dashboard:read", "clients:read", "clients:internal",
      "projects:*", "milestones:write", "updates:post", "files:*", "proposals:write",
      "messages:read", "messages:write", "tickets:read", "tickets:write", "tickets:close",
      "invoices:read", "content:read", "content:write", "media:write",
    ],
    deny: ["payments:*", "invoices:write", "clients:write", "settings:*", "staff:*", "audit:*", "backups:*"],
  },

  // Legacy roles, translated so existing accounts keep working until moved to a preset.
  finance: {
    label: "Finance (legacy)",
    description: "Invoices and payment records. No refunds or voids (owner only).",
    allow: ["dashboard:read", "reports:read", "clients:read", "invoices:read", "invoices:write", "invoices:send", "invoices:markpaid",
      "payments:read", "payments:export", "recurring:write"],
    deny: ["invoices:void", "payments:refund", "staff:*", "settings:*"],
  },
  editor: {
    label: "Editor (legacy)",
    description: "Site content, media, SEO and navigation.",
    allow: ["dashboard:read", "leads:read", "content:*", "media:write", "seo:write", "navigation:write",
      "careers:*", "applications:*", "assistant:read"],
    deny: ["staff:*", "settings:*"],
  },
  support: {
    label: "Support (legacy)",
    description: "Tickets and messages; read-only on clients and projects.",
    allow: ["dashboard:read", "leads:read", "leads:write", "consultations:*", "clients:read", "projects:read",
      "tickets:read", "tickets:write", "tickets:close", "canned:write", "messages:read", "messages:write"],
    deny: ["staff:*", "settings:*"],
  },
};

export const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[];

/** Presets offered when inviting or editing staff (legacy ones stay valid but aren't offered). */
export const ASSIGNABLE_PRESETS: PresetKey[] = ["client_manager", "delivery_lead", "admin"];

export function isPresetKey(v: unknown): v is PresetKey {
  return typeof v === "string" && (PRESET_KEYS as string[]).includes(v);
}

/** Accounts created before presets: map the legacy staff_role column. */
export function presetFromLegacy(staffRole: string | null | undefined, userRole?: string | null): PresetKey {
  switch (staffRole) {
    case "ADMIN": return "admin";
    case "MANAGER": return "client_manager";
    case "FINANCE": return "finance";
    case "EDITOR": return "editor";
    case "SUPPORT": return "support";
  }
  return userRole === "ADMIN" ? "admin" : "support"; // least privilege if unknown
}

// ==========================================
// 3. The check
// ==========================================
function matches(list: string[], perm: string): boolean {
  const area = perm.split(":")[0];
  return list.includes(perm) || list.includes(`${area}:*`) || list.includes("*");
}

/**
 * Owners get everything except these: the client manager's private account notes
 * stay private to that side (each side can't see the other's notes).
 */
export const OWNER_EXCLUDED: string[] = [""];

/** Deny beats allow. Owners can do everything except OWNER_EXCLUDED. */
export function can(user: PermissionSubject | null | undefined, perm: string): boolean {
  if (!user) return false;
  if (user.isOwner) return !OWNER_EXCLUDED.includes(perm);
  const p = PRESETS[user.preset];
  const overrides = user.overrides || [];
  const allow = [...(p?.allow ?? []), ...overrides.filter((x) => !x.startsWith("!"))];
  const deny = [...(p?.deny ?? []), ...overrides.filter((x) => x.startsWith("!")).map((x) => x.slice(1))];
  return matches(allow, perm) && !matches(deny, perm);
}

export function effectivePermissions(user: PermissionSubject): string[] {
  return ALL_PERMISSIONS.filter((perm) => can(user, perm));
}

/**
 * Keep only well-formed overrides: "area:action" or "area:*" from the catalog,
 * optionally prefixed with "!". Never "*" (that would make someone an owner).
 */
export function sanitizeOverrides(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const neg = raw.startsWith("!");
    const key = neg ? raw.slice(1) : raw;
    const [area, action] = key.split(":");
    const ok = ALL_PERMISSIONS.includes(key) || (action === "*" && AREAS.has(area));
    if (ok) out.add(neg ? `!${key}` : key);
  }
  return [...out];
}

// ==========================================
// 4. Routes (sidebar + direct URL checks)
// ==========================================
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/admin/tasks": "dashboard:read",
  "/admin/leads": "leads:read",
  "/admin/consultations": "consultations:read",
  "/admin/clients": "clients:read",
  "/admin/projects": "projects:read",
  "/admin/invoices": "invoices:read",
  "/admin/recurring": "invoices:read",
  "/admin/payments": "payments:read",
  "/admin/support": "tickets:read",
  "/admin/messages": "messages:read",
  "/admin/home": "content:publish",
  "/admin/pages": "content:publish",
  "/admin/services": "content:publish",
  "/admin/solutions": "content:publish",
  "/admin/industries": "content:publish",
  "/admin/work": "content:read",
  "/admin/blog": "content:read",
  "/admin/testimonials": "content:read",
  "/admin/team": "content:publish",
  "/admin/faq": "content:publish",
  "/admin/pricing": "plans:write",
  "/admin/careers": "careers:read",
  "/admin/applications": "applications:read",
  "/admin/media": "media:write",
  "/admin/navigation": "navigation:write",
  "/admin/seo": "seo:write",
  "/admin/redirects": "seo:write",
  "/admin/settings": "settings:read",
  "/admin/assistant": "assistant:read",
  "/admin/analytics": "analytics:read",
  "/admin/reports": "reports:read",
  "/admin/users": "staff:read",
  "/admin/audit": "audit:read",
  "/admin/integrations": "integrations:read",
  "/admin/email": "emails:write",
  "/admin/privacy": "privacy:write",
  "/admin/health": "health:read",
  "/admin/backups": "backups:export",
};

export function canAccessRoute(user: PermissionSubject, path: string): boolean {
  for (const [prefix, permission] of Object.entries(ROUTE_PERMISSION_MAP)) {
    // Keys are internal folder paths; `path` is the public (subdomain) pathname.
    if (path.startsWith(adminPath(prefix))) return can(user, permission);
  }
  return true; // Overview, profile, welcome
}

export function presetLabel(user: Pick<StaffSessionUser, "preset">): string {
  return PRESETS[user.preset]?.label ?? user.preset;
}
