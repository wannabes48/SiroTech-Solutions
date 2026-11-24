import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminFaqPage() {
  await requireStaffUser("content:publish");
  const faqs = await getAdminContentList("faq");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Frequently Asked Questions (FAQ)"
        subtitle="Manage grouped public FAQs covering contracts, pricing, code ownership, and timelines."
        breadcrumbs={[{ label: "Content" }, { label: "FAQ" }]}
      />

      <ContentListManager
        type="faq"
        typeName="FAQ Items"
        items={faqs}
      />
    </div>
  );
}
