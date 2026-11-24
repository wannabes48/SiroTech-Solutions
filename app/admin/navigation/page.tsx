import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminNavigationClient } from "./AdminNavigationClient";

export default async function AdminNavigationPage() {
  await requireStaffUser("navigation:write");

  let headerItems = [
    { label: "Services", href: "/services" },
    { label: "Solutions", href: "/solutions" },
    { label: "Work", href: "/work" },
    { label: "Industries", href: "/industries" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" }
  ];

  try {
    const res = await query("SELECT items FROM menus WHERE key = 'header'");
    if (res.rows.length > 0 && Array.isArray(res.rows[0].items) && res.rows[0].items.length > 0) {
      headerItems = res.rows[0].items;
    }
  } catch (err) {
    console.error("Navigation load error:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Navigation &amp; Menus"
        subtitle="Manage desktop and mobile header navigation links, dropdown taxonomies, and footer menus."
        breadcrumbs={[{ label: "Site" }, { label: "Navigation" }]}
      />

      <AdminNavigationClient
        initialHeaderItems={headerItems}
        initialFooterItems={[]}
      />
    </div>
  );
}
