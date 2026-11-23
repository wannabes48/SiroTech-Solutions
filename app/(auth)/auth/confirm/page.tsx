import Link from "next/link";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { confirmAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Continue to SiroTech", robots: { index: false, follow: false } };

const TITLES: Record<string, string> = {
  invite: "Accept your invitation",
  recovery: "Reset your password",
  signup: "Confirm your email",
};

/**
 * Shared by portal.* and admin.*. Mail scanners open every link, so this page
 * does nothing on load; the token is only exchanged when the person presses Continue.
 * Served with Cache-Control: no-store and Referrer-Policy: no-referrer (middleware + next.config).
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash, type, next } = await searchParams;

  if (!token_hash || !type) {
    return (
      <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
        <div className="flex items-center gap-2 text-red-700 mb-3">
          <AlertCircle className="w-5 h-5" />
          <h1 className="text-xl font-bold tracking-tight text-ink">This link isn&apos;t complete</h1>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          The link may have been cut off by your email app. Open it again from the email, or request a new sign-in link.
        </p>
        <Link href="/sign-in" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Go to sign in <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-rule/80 p-8 sm:p-10 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{TITLES[type] || "Continue to SiroTech"}</h1>
        <p className="text-muted text-xs sm:text-sm mt-1.5">Press continue to finish signing in. This link works once.</p>
      </div>
      <form action={confirmAction}>
        <input type="hidden" name="token_hash" value={token_hash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next ?? "/"} />
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      <p className="mt-5 flex items-center gap-1.5 text-[11px] text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        If you didn&apos;t request this, close this page. Nothing happens until you press continue.
      </p>
    </div>
  );
}
