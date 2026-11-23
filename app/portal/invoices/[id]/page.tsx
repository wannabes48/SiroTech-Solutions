import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { getPortalInvoiceDetail } from "@/lib/portal-db";
import { InvoiceDetailClient } from "@/components/portal/invoice/InvoiceDetailClient";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  const invoice = await getPortalInvoiceDetail(user.orgId, id, isStaff);
  if (!invoice) {
    notFound();
  }

  return <InvoiceDetailClient invoice={invoice} user={user} />;
}
