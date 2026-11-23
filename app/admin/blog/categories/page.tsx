import { adminPath } from "@/lib/hosts";
import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookOpen, Tag } from "lucide-react";

export default async function AdminBlogCategoriesPage() {
  await requireStaffUser("blog:read");

  const categories = [
    { slug: "architecture", name: "System Architecture", count: 4, desc: "High-concurrency distributed systems, database scaling, and microservices." },
    { slug: "fintech", name: "FinTech & Payments", count: 3, desc: "M-Pesa Daraja APIs, ISO 20022 messaging, and transaction reconciliation." },
    { slug: "mobile", name: "Mobile Engineering", count: 2, desc: "Offline-first sync, SQLite/WatermelonDB, and React Native platforms." },
    { slug: "ai", name: "AI & Automation", count: 3, desc: "Large Language Models, agentic automation, and localized embeddings." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Blog Categories"
        subtitle="Organize technical publications by engineering domain and topic taxonomies."
        breadcrumbs={[
          { label: "Content", href: adminPath("/blog") },
          { label: "Blog", href: adminPath("/blog") },
          { label: "Categories" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.slug} className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-ink">{cat.name}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface border border-rule text-muted">
                {cat.count} articles
              </span>
            </div>
            <p className="text-xs text-body leading-relaxed">{cat.desc}</p>
            <div className="text-[11px] font-mono text-muted pt-2 border-t border-rule/50">
              /blog/category/{cat.slug}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
