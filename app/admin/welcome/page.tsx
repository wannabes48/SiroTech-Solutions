import Link from "next/link";
import { ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { adminPath } from "@/lib/hosts";
import { SetPasswordCard } from "@/components/auth/SetPasswordCard";

export const dynamic = "force-dynamic";

/** Landing page after a staff invite: optional password, then two-step setup. */
export default async function AdminWelcomePage() {
  const staff = await requireStaffUser();
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome to SiroTech, {staff.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted mt-1">Two quick steps and you&apos;re set up.</p>
      </div>

      <SetPasswordCard title="1. Set a password (optional)" />

      <div className="p-5 rounded-2xl bg-white border border-rule/80 shadow-xs text-xs space-y-3">
        <h2 className="text-sm font-bold text-ink">2. Turn on two-step sign-in</h2>
        {staff.totpEnabled ? (
          <p className="flex items-center gap-2 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Your authenticator app is already set up.
          </p>
        ) : (
          <>
            <p className="text-muted">Staff accounts must use an authenticator app (Google Authenticator, 1Password, Authy).</p>
            <Link
              href={adminPath("/profile")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B2E24] hover:bg-black text-white font-semibold"
            >
              <KeyRound className="w-3.5 h-3.5" /> Set up authenticator
            </Link>
          </>
        )}
      </div>

      <Link href={adminPath()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-900">
        Continue to dashboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
