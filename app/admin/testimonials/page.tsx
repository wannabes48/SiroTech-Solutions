import React from "react";
import { requireStaffUser, can } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminTestimonialsPage() {
  const staff = await requireStaffUser("content:read");
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
        canPublish={can(staff, "content:publish")}
        canDelete={can(staff, "content:delete")}
        typeName="Testimonials"
        items={testimonials}
      />
    </div>
  );
}
