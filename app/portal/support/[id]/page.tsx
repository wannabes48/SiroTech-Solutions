import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { getPortalTicketDetail } from "@/lib/portal-db";
import { SupportTicketDetailClient } from "@/components/portal/support/SupportTicketDetailClient";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  const ticket = await getPortalTicketDetail(user.orgId, id, isStaff);
  if (!ticket) {
    notFound();
  }

  return <SupportTicketDetailClient ticket={ticket} user={user} />;
}
