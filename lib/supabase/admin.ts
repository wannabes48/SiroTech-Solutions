import { createClient, type User } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./cookies";

/**
 * Server-only Supabase clients. Never import from client components.
 * - supabaseAdmin: service role (invites, user management, app_metadata). Needs SUPABASE_SERVICE_ROLE_KEY.
 * - supabaseAnon:  anon key without a session, for sending sign-in / reset emails.
 */
const noSession = { auth: { autoRefreshToken: false, persistSession: false } };

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-service-role-key",
  noSession
);
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noSession);

export const hasServiceRole = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Find a Supabase auth user by email without sending mail. generateLink creates
 * (but does not send) a token and returns the user; used only to resolve the id
 * of an auth user that exists but is not linked to a profile yet.
 */
export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.user) return null;
  return data.user;
}
