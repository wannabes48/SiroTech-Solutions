import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-server";
import TwoStepForm from "./TwoStepForm";

export const dynamic = "force-dynamic";

export default async function TwoStepPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!(await getAuthContext())) redirect("/sign-in");
  const { next } = await searchParams;
  return <TwoStepForm next={next || "/"} />;
}
