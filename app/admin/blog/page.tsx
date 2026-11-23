import { adminPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { requireStaffUser } from "@/lib/admin-permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentListManager } from "@/components/admin/content/ContentListManager";
import { getAllPosts } from "@/lib/blog";

export default async function AdminBlogPage() {
  await requireStaffUser("blog:read");

  let posts: any[] = [];
  try {
    const rawPosts = await getAllPosts();
    posts = rawPosts.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary || p.description,
      status: "PUBLISHED",
      type: "post"
    }));
  } catch (err) {
    console.error("Error fetching blog posts:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Technical Blog Articles"
        subtitle="Manage engineering articles, system architecture deep-dives, and technical tutorials."
        breadcrumbs={[{ label: "Content" }, { label: "Blog" }]}
        secondaryAction={{
          label: "Categories",
          href: adminPath("/blog/categories")
        }}
      />

      <ContentListManager
        type="post"
        typeName="Blog Articles"
        items={posts}
      />
    </div>
  );
}
