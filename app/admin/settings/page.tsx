import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminSiteSettings, getAdminFeatureFlags } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  await requireStaffUser("settings:read");
  const [settings, featureFlags] = await Promise.all([
    getAdminSiteSettings(),
    getAdminFeatureFlags()
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Global Settings &amp; Governance"
        subtitle="Configure corporate registration, multi-currency multipliers, lead routing, statutory retention, feature flags, and maintenance modes."
        breadcrumbs={[{ label: "Site" }, { label: "Settings" }]}
      />

      <SettingsClient 
        initialSettings={JSON.parse(JSON.stringify(settings))} 
        initialFlags={JSON.parse(JSON.stringify(featureFlags))} 
      />
    </div>
  );
}
