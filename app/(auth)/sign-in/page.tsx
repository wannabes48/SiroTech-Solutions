import { headers } from "next/headers";
import { areaForHost } from "@/lib/hosts";
import SignInForm from "./SignInForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  // admin.* → staff sign-in (email, password, authenticator code); portal.* → client sign-in.
  const area = areaForHost((await headers()).get("host"));
  return <SignInForm variant={area === "admin" ? "admin" : "portal"} />;
}
