import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getAdminContentList } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";

export default async function AdminPagesPage() {
  await requireStaffUser("content:publish");

  const staticPages = [
    { slug: "legal/privacy", title: "Privacy Policy", summary: "Data protection guidelines under Kenya DPA 2019 & GDPR.", status: "PUBLISHED", type: "page" },
    { slug: "legal/terms", title: "Terms of Service", summary: "Contractual terms governing engineering engagements and deliverables.", status: "PUBLISHED", type: "page" },
    { slug: "legal/cookies", title: "Cookie Policy", summary: "Disclosure of cookies, session tokens, and local storage tokens.", status: "PUBLISHED", type: "page" },
    { slug: "legal/accessibility", title: "Accessibility Statement", summary: "Compliance benchmarks with WCAG 2.1 AA accessibility standards.", status: "PUBLISHED", type: "page" },
    { slug: "legal/refunds", title: "Refund Policy", summary: "Milestone payment settlement, escrow terms, and dispute procedures.", status: "PUBLISHED", type: "page" },
    { slug: "about", title: "About Studio", summary: "Studio history, Nairobi engineering team, and engineering ethos.", status: "PUBLISHED", type: "page" },
    { slug: "process", title: "Engineering Process", summary: "Four-phase delivery methodology: Blueprint, Sprints, Hardening, Launch.", status: "PUBLISHED", type: "page" },
    { slug: "engagement", title: "Engagement Models", summary: "Fixed-scope sprint deliverables, dedicated teams, and retainers.", status: "PUBLISHED", type: "page" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Pages &amp; Legal Policies"
        subtitle="Manage public marketing pages, terms of service, privacy guidelines, and statutory disclosures."
        breadcrumbs={[{ label: "Content" }, { label: "Pages" }]}
      />

      <ContentListManager
        type="page"
        typeName="Pages"
        items={staticPages}
      />
    </div>
  );
}
