import { portalPath } from "@/lib/hosts";
import { redirect } from "next/navigation";

export default async function TicketDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(portalPath(`/support/${id}`));
}
