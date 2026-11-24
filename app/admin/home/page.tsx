import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminSiteSettings } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomeEditorClient } from "./HomeEditorClient";

export default async function AdminHomePage() {
  await requireStaffUser("content:publish");
  const settings = await getAdminSiteSettings();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Homepage Content &amp; Sections"
        subtitle="Control homepage hero copy, engineering tagline, kinetic background effects, and featured project order."
        breadcrumbs={[{ label: "Content" }, { label: "Homepage" }]}
      />

      <HomeEditorClient settings={settings.general || {}} />
    </div>
  );
}
