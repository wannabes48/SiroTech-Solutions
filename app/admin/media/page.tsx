import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminMedia } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibraryClient } from "./MediaLibraryClient";

export default async function AdminMediaPage() {
  await requireStaffUser("media:read");
  const mediaItems = await getAdminMedia();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Media Library &amp; Asset Vault"
        subtitle="Manage brand logos, architectural diagrams, project mockups, and enforce mandatory WCAG alt text."
        breadcrumbs={[{ label: "Content" }, { label: "Media" }]}
      />

      <MediaLibraryClient initialMedia={mediaItems} />
    </div>
  );
}
