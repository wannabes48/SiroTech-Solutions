import { portalPath } from "@/lib/hosts";
import { redirect } from "next/navigation";

export default function TicketsRedirectPage() {
  redirect(portalPath("/support"));
}
