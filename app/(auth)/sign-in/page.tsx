import { headers } from "next/headers";
import { areaForHost } from "@/lib/hosts";
import SignInForm from "./SignInForm";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  expired: "That link has expired or was already used. Request a new sign-in link below.",
  "not-allowed": "This account can't sign in here. Contact SiroTech if you think this is a mistake.",
  "wrong-area": "This account signs in on the other SiroTech site (clients: portal, staff: admin).",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  // admin.* → staff sign-in (email, password, authenticator code); portal.* → client sign-in.
  const area = areaForHost((await headers()).get("host"));
  const { error, next } = await searchParams;
  return (
    <SignInForm
      variant={area === "admin" ? "admin" : "portal"}
      initialError={error ? ERRORS[error] || null : null}
      next={next || "/"}
    />
  );
}
