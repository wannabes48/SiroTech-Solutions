import { adminPath } from "@/lib/hosts";
import React from "react";
import { requireStaffUser } from "@/lib/admin-permissions";
import { query } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { GraduationCap, Mail, Phone, FileText, ExternalLink } from "lucide-react";

export default async function AdminApplicationsPage() {
  await requireStaffUser("applications:read");

  let applications: any[] = [];
  try {
    const res = await query(`SELECT * FROM job_applications ORDER BY created_at DESC`);
    applications = res.rows;
  } catch (err) {
    console.error("Error fetching job applications:", err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Candidate Job Applications"
        subtitle="Review inbound software engineering resumes, portfolios, and interview stages."
        breadcrumbs={[
          { label: "Content", href: adminPath("/careers") },
          { label: "Careers", href: adminPath("/careers") },
          { label: "Applications" }
        ]}
      />

      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-6">Applied Role</th>
                <th className="py-3 px-6">Contact Info</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Applied Date</th>
                <th className="py-3 px-6 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {applications.length > 0 ? (
                applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-ink">{app.name}</td>
                    <td className="py-4 px-6 font-medium text-ink">{app.job_title || "Fullstack Engineer"}</td>
                    <td className="py-4 px-6 text-muted">
                      <div>{app.email}</div>
                      <div className="text-[11px]">{app.phone || "No phone"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <AdminStatusPill status={app.status || "NEW"} />
                    </td>
                    <td className="py-4 px-6 text-muted">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-surface hover:bg-sage-100 text-ink border border-rule inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Resume</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted">
                    No job applications submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
