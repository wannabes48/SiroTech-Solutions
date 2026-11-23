import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { mainUrl } from "@/lib/hosts";

export const metadata = { title: "Invitation", robots: { index: false, follow: false } };

/**
 * Legacy invite links (/invite/<token>) from before the move to Supabase Auth.
 * New invitations arrive as an "Accept invitation" email that opens /auth/confirm.
 * Anyone with an old link can still get in with a sign-in link if their account exists.
 */
export default function LegacyInvitePage() {
  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
        <Mail className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">This invitation link has been replaced</h1>
      <p className="text-muted text-sm mt-2 leading-relaxed">
        We&apos;ve upgraded how sign-in works. If you were invited, request a sign-in link with your email address. If that
        doesn&apos;t work, ask your SiroTech contact to send a new invitation.
      </p>
      <Link
        href="/sign-in"
        className="mt-6 w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2"
      >
        <span>Request a sign-in link</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="mt-6 text-center text-xs text-muted">
        Need help?{" "}
        <Link href={mainUrl("/contact")} className="font-semibold text-ink hover:text-emerald-700">
          Contact SiroTech
        </Link>
      </p>
    </div>
  );
}
