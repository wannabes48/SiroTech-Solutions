import { adminPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { requireStaffUser } from "@/lib/admin-permissions";
import { getScopeSet, filterByScope, enforceScope } from "@/lib/admin-scope";

import { getAdminClients } from "@/lib/admin-db";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Building2, Users, FolderGit2, ArrowRight, DollarSign } from "lucide-react";

export default async function AdminClientsPage() {
  const staff = await requireStaffUser("clients:read");
  const clients = filterByScope(await getAdminClients(), await getScopeSet(staff), { org: "id" });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminPageHeader
        title="Client Organizations"
        subtitle="Manage client company workspaces, user memberships, and live project deliverables."
        breadcrumbs={[{ label: "Sales" }, { label: "Clients" }]}
      />

      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">Company / Organization</th>
                <th className="py-3 px-6">Billing Email</th>
                <th className="py-3 px-6">Active Projects</th>
                <th className="py-3 px-6">Team Members</th>
                <th className="py-3 px-6">Total Paid (KES)</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-surface/40 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={adminPath(`/clients/${c.id}`)} className="block group">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink group-hover:text-emerald-700 transition-colors">
                          {c.name.replace(/^\[DEACTIVATED\]\s*/i, "")}
                        </span>
                        {c.name.startsWith("[DEACTIVATED]") ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                            Deactivated
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-muted text-[11px] mt-0.5">
                        {c.country || "Kenya"} &bull; {c.tax_pin || "No PIN registered"}
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-ink">{c.billing_email || "Not set"}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <FolderGit2 className="w-3.5 h-3.5 text-muted" />
                      {c.project_count} projects
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                      <Users className="w-3.5 h-3.5 text-muted" />
                      {c.user_count} users
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-ink">
                    KES {Number(c.total_paid_kes || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={adminPath(`/clients/${c.id}`)}
                      className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface inline-block"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
