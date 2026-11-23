import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminTestimonialsPage() {
  await requireStaffUser("content:read");
  const testimonials = await getAdminContentList("testimonial");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Client Testimonials &amp; Quotes"
        subtitle="Manage client endorsements, engineering reviews, and verified enterprise testimonials."
        breadcrumbs={[{ label: "Content" }, { label: "Testimonials" }]}
      />

      <ContentListManager
        type="testimonial"
        typeName="Testimonials"
        items={testimonials}
      />
    </div>
  );
}
