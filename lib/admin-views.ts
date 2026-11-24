import { can, type PermissionSubject } from "./admin-permissions-client";

/**
 * Remove private fields on the server before data reaches a page the person may
 * see. Never send them to the browser and hide them with CSS.
 *
 *   accountNotes  (organizations.account_notes)  needs clients:internal  (client manager's notes)
 *   deliveryNotes (projects.delivery_notes)      needs projects:internal (delivery's notes)
 */
export function projectView<T extends Record<string, any>>(user: PermissionSubject, p: T): T {
  if (!p || can(user, "projects:internal")) return p;
  const { delivery_notes, ...rest } = p;
  return rest as T;
}

export function clientView<T extends Record<string, any>>(user: PermissionSubject, org: T): T {
  if (!org) return org;
  let out: Record<string, any> = org;
  if (!can(user, "clients:internal")) {
    const { account_notes, ...rest } = out;
    out = rest;
  }
  if (Array.isArray(out.projects)) {
    out = { ...out, projects: out.projects.map((p: Record<string, any>) => projectView(user, p)) };
  }
  return out as T;
}
