import { portalPath } from "@/lib/hosts";
import { redirect } from "next/navigation";

export default function TicketsNewRedirectPage() {
  redirect(portalPath("/support/new"));
}
