/** People-table status, derived from profile columns. Safe for client components. */
export type AccessStatus = "ACTIVE" | "INVITED" | "EXPIRED" | "DISABLED" | "NOT_INVITED";

/** How long an invite / sign-in link is treated as usable (match the Supabase email OTP expiry). */
export const LINK_TTL_HOURS = Number(process.env.NEXT_PUBLIC_AUTH_LINK_TTL_HOURS || 24);

export function accessStatus(u: {
  active?: boolean | null;
  accepted_at?: string | Date | null;
  last_login_at?: string | Date | null;
  invited_at?: string | Date | null;
  last_access_email_at?: string | Date | null;
}): AccessStatus {
  if (u.active === false) return "DISABLED";
  if (u.accepted_at || u.last_login_at) return "ACTIVE";
  const sent = u.last_access_email_at || u.invited_at;
  if (!sent) return "NOT_INVITED";
  return Date.now() - new Date(sent).getTime() > LINK_TTL_HOURS * 3600_000 ? "EXPIRED" : "INVITED";
}

export const ACCESS_STATUS_LABEL: Record<AccessStatus, string> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  EXPIRED: "Expired / link not used",
  DISABLED: "Disabled",
  NOT_INVITED: "Not invited",
};
