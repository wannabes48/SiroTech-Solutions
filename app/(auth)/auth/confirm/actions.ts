"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { completeSignIn, sessionIdFromAccessToken } from "@/lib/auth-flow";

const TYPES: EmailOtpType[] = ["invite", "email", "magiclink", "recovery", "signup", "email_change"];

/** Exchange the one-time token — only on an explicit POST (button press), never on page load. */
export async function confirmAction(fd: FormData) {
  const token_hash = String(fd.get("token_hash") || "");
  const type = String(fd.get("type") || "") as EmailOtpType;
  const next = String(fd.get("next") || "/");
  if (!token_hash || !TYPES.includes(type)) redirect("/sign-in?error=expired");

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error || !data.user) redirect("/sign-in?error=expired");

  const done = await completeSignIn(supabase, data.user, sessionIdFromAccessToken(data.session?.access_token), {
    method: `link:${type}`,
    next: type === "recovery" ? "/reset-password" : next,
    isInvite: type === "invite",
  });
  if (!done.ok) redirect(`/sign-in?error=${done.code}`);
  redirect(done.redirect);
}
