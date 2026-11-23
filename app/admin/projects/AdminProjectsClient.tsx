"use client";

import { adminPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { createProjectFromTemplateAction, deleteProjectAction } from "@/app/admin/actions";
import {
  FolderGit2,
  ArrowRight,
  ExternalLink,
  Calendar,
  Plus,
  Loader2,
  Layers,
  Building2,
  Sparkles,
  AlertTriangle,
  Trash2
} from "lucide-react";

export function AdminProjectsClient({
  initialProjects,
  organizations,
  defaultOrgId,
  initialOpenModal = false
}: {
  initialProjects: any[];
  organizations: any[];
  defaultOrgId?: string;
  initialOpenModal?: boolean;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [showTemplateModal, setShowTemplateModal] = useState(initialOpenModal);
  const [isPending, startTransition] = useTransition();

  // Template form state
  const [selectedOrgId, setSelectedOrgId] = useState(defaultOrgId || organizations[0]?.id || "");
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<"Website" | "Web app" | "Mobile app" | "Retainer">("Web app");
  const [targetLaunch, setTargetLaunch] = useState("");
  const [summary, setSummary] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !title.trim()) return;

    startTransition(async () => {
      const res = await createProjectFromTemplateAction({
        orgId: selectedOrgId,
        title: title.trim(),
        template,
        targetLaunch,
        summary: summary.trim()
      });

      if (res.success) {
        setShowTemplateModal(false);
        router.push(adminPath(`/projects/${res.projectId}`));
      }
    });
  };

  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${projectTitle}" and all associated milestones, updates, and deliverables? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      await deleteProjectAction(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowTemplateModal(true)}
          className="py-2.5 px-4 rounded-full bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project from Template</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p: any) => (
          <div
            key={p.id}
            className="p-6 rounded-3xl bg-white border border-rule/80 hover:border-emerald-600/50 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {p.org_name}
                </span>
                <AdminStatusPill status={p.status} />
              </div>

              <div>
                <h3 className="text-base font-bold text-ink tracking-tight">
                  <Link href={adminPath(`/projects/${p.id}`)} className="hover:text-emerald-700 transition-colors">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs text-body line-clamp-2 leading-relaxed">
                  {p.summary}
                </p>
              </div>

              {p.changes_requested_count > 0 && (
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{p.changes_requested_count} Milestone revision{p.changes_requested_count > 1 ? "s" : ""} requested by client</span>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2 border-t border-rule/60">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted">
                  <span>Sprint Progress</span>
                  <span className="font-bold text-ink">{p.progress}%</span>
                </div>
                <div className="w-full bg-rule/70 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  Target: {p.target_launch ? (p.target_launch instanceof Date ? p.target_launch.toLocaleDateString() : String(p.target_launch)) : "TBD"}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={adminPath(`/projects/${p.id}`)}
                    className="font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>Manage Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDeleteProject(p.id, p.title)}
                    className="p-1 rounded-lg text-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project from Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Create Project from Template
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Pre-populates deliverables, sprint phases, and approval milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-muted hover:text-ink text-xs font-semibold cursor-pointer"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Client Organization</label>
                <select
                  required
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule font-medium text-xs"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen B2B Logistics Portal"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Delivery Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Website", "Web app", "Mobile app", "Retainer"] as const).map((t) => (
                    <label
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        template === t
                          ? "bg-emerald-50 border-emerald-500 font-bold text-emerald-950"
                          : "bg-surface/50 border-rule/70 text-muted hover:bg-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={template === t}
                        onChange={() => setTemplate(t)}
                        className="sr-only"
                      />
                      <div className="text-xs">{t}</div>
                      <div className="text-[10px] font-normal text-muted mt-0.5">
                        {t === "Website" && "5 milestones (Design, Next.js, SEO)"}
                        {t === "Web app" && "5 milestones (DB, MVP, API, Deploy)"}
                        {t === "Mobile app" && "4 milestones (React Native, Stores)"}
                        {t === "Retainer" && "3 milestones (SLA, Hypercare, Tuning)"}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Target Launch Date</label>
                <input
                  type="date"
                  value={targetLaunch}
                  onChange={(e) => setTargetLaunch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Brief / Scope Description</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Key technical goals, integrations, and deliverable targets..."
                  className="w-full p-2.5 rounded-xl bg-surface border border-rule text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rule/50">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-full font-semibold text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full font-bold bg-[#1B2E24] hover:bg-black text-white cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Initialize Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
