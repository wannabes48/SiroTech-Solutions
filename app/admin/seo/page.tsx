import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Search, Globe, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminSeoPage() {
  await requireStaffUser("seo:read");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="SEO &amp; Discoverability Engine"
        subtitle="Sitemap indexing, robots.txt directives, OpenGraph meta tags, and SERP visibility."
        breadcrumbs={[{ label: "Site" }, { label: "SEO" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sitemap Status */}
        <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">XML Sitemap</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-ink">sitemap.xml</div>
          <p className="text-xs text-muted leading-relaxed">
            Dynamic sitemap automatically indexing 35+ routes (services, case studies, solutions, blog posts).
          </p>
          <div className="pt-2">
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <span>View Raw Sitemap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Robots.txt Directives */}
        <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Robots Directives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-ink">robots.txt</div>
          <p className="text-xs text-muted leading-relaxed">
            Crawling authorized for public routes; `/portal`, `/admin`, and `/api` disallowed.
          </p>
          <div className="pt-2">
            <Link
              href="/robots.txt"
              target="_blank"
              className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Structured Data */}
        <div className="p-6 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">JSON-LD Schemas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-ink">Schema.org</div>
          <p className="text-xs text-muted leading-relaxed">
            Organization, BreadcrumbList, TechArticle, and Service schemas enabled across all pages.
          </p>
        </div>
      </div>
    </div>
  );
}
