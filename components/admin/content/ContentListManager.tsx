"use client";

import React, { useState, useTransition } from "react";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Archive,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react";
import {
  saveContentItemAction,
  archiveContentItemAction,
  deleteContentItemAction,
  checkContentInUseAction
} from "@/app/admin/actions";

export interface ContentItemRow {
  id?: string;
  type: string;
  slug: string;
  title: string;
  summary?: string;
  content?: any;
  status: string;
  order_num?: number;
  updated_at?: string;
}

export function ContentListManager({
  type,
  typeName,
  items: initialItems,
  createHref
}: {
  type: string;
  typeName: string;
  items: ContentItemRow[];
  createHref?: string;
}) {
  const [items, setItems] = useState<ContentItemRow[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Editor Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    slug: string;
    title: string;
    summary: string;
    status: string;
    client?: string;
    permissionGranted?: boolean;
    serviceSlug?: string;
    challenge?: string;
    solution?: string;
    technologies?: string;
    deliverables?: string;
    seoTitle?: string;
    seoDesc?: string;
  }>({
    slug: "",
    title: "",
    summary: "",
    status: "PUBLISHED"
  });

  // In-Use Protection Modal State
  const [inUseModal, setInUseModal] = useState<{
    open: boolean;
    slug: string;
    title: string;
    references: string[];
  }>({
    open: false,
    slug: "",
    title: "",
    references: []
  });

  // Delete Confirmation Modal (when item is NOT in use)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    slug: string;
    title: string;
  }>({
    open: false,
    slug: "",
    title: ""
  });

  const filtered = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(term) ||
      item.slug.toLowerCase().includes(term) ||
      (item.summary && item.summary.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "ALL" || (item.status || "PUBLISHED").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (item: ContentItemRow) => {
    const c = typeof item.content === "string" ? JSON.parse(item.content) : item.content || {};
    setEditingItem({
      slug: item.slug,
      title: item.title,
      summary: item.summary || "",
      status: item.status || "PUBLISHED",
      client: c.client || "",
      permissionGranted: c.permissionGranted !== undefined ? Boolean(c.permissionGranted) : true,
      serviceSlug: c.serviceSlug || "custom-software",
      challenge: typeof c.challenge === "string" ? c.challenge : c.challenge?.description || "",
      solution: typeof c.solution === "string" ? c.solution : c.solution?.description || "",
      technologies: Array.isArray(c.technologies) ? c.technologies.join(", ") : (c.technologies || ""),
      deliverables: Array.isArray(c.deliverables) ? c.deliverables.join("\n") : (c.deliverables || ""),
      seoTitle: c.seoTitle || "",
      seoDesc: c.seoDesc || ""
    });
    setEditModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payloadContent: any = {
        client: editingItem.client,
        permissionGranted: editingItem.permissionGranted,
        serviceSlug: editingItem.serviceSlug,
        challenge: editingItem.challenge,
        solution: editingItem.solution,
        technologies: editingItem.technologies
          ? editingItem.technologies.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        deliverables: editingItem.deliverables
          ? editingItem.deliverables.split("\n").map((s) => s.trim()).filter(Boolean)
          : undefined
      };

      const res = await saveContentItemAction({
        type,
        slug: editingItem.slug,
        title: editingItem.title,
        summary: editingItem.summary,
        content: payloadContent,
        status: editingItem.status,
        seoTitle: editingItem.seoTitle,
        seoDesc: editingItem.seoDesc
      });

      if (res?.error) {
        showToast(`Save failed: ${res.error}`);
      } else {
        if (res.anonymized) {
          showToast(`Saved! Client was anonymized as 'Unnamed multinational' (permission checkbox unchecked).`);
        } else {
          showToast(`Successfully saved "${editingItem.title}"`);
        }

        // Optimistically update list
        setItems((prev) =>
          prev.map((it) =>
            it.slug === editingItem.slug
              ? {
                  ...it,
                  title: editingItem.title,
                  summary: editingItem.summary,
                  status: editingItem.status,
                  content: payloadContent
                }
              : it
          )
        );
        setEditModalOpen(false);
      }
    });
  };

  const handleArchiveItem = (slug: string, title: string) => {
    startTransition(async () => {
      const res = await archiveContentItemAction(type, slug);
      if (res?.error) {
        showToast(`Archive failed: ${res.error}`);
      } else {
        showToast(`Archived "${title}". It is now hidden from public views.`);
        setItems((prev) =>
          prev.map((it) => (it.slug === slug ? { ...it, status: "ARCHIVED" } : it))
        );
        setInUseModal({ open: false, slug: "", title: "", references: [] });
      }
    });
  };

  const handleDeleteClick = async (item: ContentItemRow) => {
    // 1. Check in-use status first
    startTransition(async () => {
      const check = await checkContentInUseAction(type, item.slug);
      if (check.inUse) {
        // Show In-Use Protection modal
        setInUseModal({
          open: true,
          slug: item.slug,
          title: item.title,
          references: check.references
        });
      } else {
        // Show confirmation modal
        setDeleteConfirmModal({
          open: true,
          slug: item.slug,
          title: item.title
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const res = await deleteContentItemAction(type, deleteConfirmModal.slug);
      if (res?.error) {
        showToast(`Delete blocked: ${res.error}`);
      } else {
        showToast(`Successfully deleted "${deleteConfirmModal.title}"`);
        setItems((prev) => prev.filter((it) => it.slug !== deleteConfirmModal.slug));
        setDeleteConfirmModal({ open: false, slug: "", title: "" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white border border-rule text-muted hover:text-ink hover:bg-surface/50"
              }`}
            >
              {st} ({st === "ALL" ? items.length : items.filter((i) => (i.status || "PUBLISHED").toUpperCase() === st).length})
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${typeName.toLowerCase()}...`}
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Title &amp; Slug</th>
                <th className="py-3.5 px-6">Summary / Scope</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Protection &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.slug} className="hover:bg-surface/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-ink text-sm">{item.title}</div>
                      <div className="text-muted font-mono text-[11px] mt-0.5">/{item.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-muted max-w-md">
                      <p className="line-clamp-2 leading-relaxed">
                        {item.summary || "No description summary."}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <AdminStatusPill status={item.status || "PUBLISHED"} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface hover:bg-sage-100 text-ink border border-rule inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-muted" />
                          <span>Edit</span>
                        </button>

                        {/* Archive Button */}
                        {item.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() => handleArchiveItem(item.slug, item.title)}
                            disabled={isPending}
                            title="Archive item (hides from public site safely)"
                            className="p-1.5 rounded-full text-xs font-semibold bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center transition cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* In-Use Protected Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          disabled={isPending}
                          title="Delete with in-use relationship protection"
                          className="p-1.5 rounded-full text-xs font-semibold bg-white hover:bg-red-50 text-red-700 border border-red-200 inline-flex items-center transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-muted">
                    No items found matching the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Edit / Create Drawer Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-rule shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div>
                <h3 className="font-bold text-base text-ink">Edit {typeName.slice(0, -1) || typeName}: {editingItem.title}</h3>
                <p className="text-xs text-muted">/{editingItem.slug}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-muted hover:text-ink text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface border border-rule focus:ring-1 focus:ring-emerald-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Publish Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-surface border border-rule font-medium focus:ring-1 focus:ring-emerald-700 outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Summary / Overview</label>
                <textarea
                  rows={2}
                  value={editingItem.summary}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className="w-full p-3 rounded-xl text-xs bg-surface border border-rule focus:ring-1 focus:ring-emerald-700 outline-none"
                  required
                />
              </div>

              {/* Case Study Specific Fields */}
              {type === "work" && (
                <div className="p-4 rounded-2xl bg-surface/50 border border-rule/80 space-y-4">
                  <div className="font-semibold text-xs text-ink flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Case Study Confidentiality &amp; Deliverables</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Client Name</label>
                      <input
                        type="text"
                        value={editingItem.client || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, client: e.target.value })}
                        placeholder="e.g. CoastLane Logistics Ltd"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-rule outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1">Associated Service</label>
                      <select
                        value={editingItem.serviceSlug}
                        onChange={(e) => setEditingItem({ ...editingItem, serviceSlug: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-rule outline-none"
                      >
                        <option value="custom-software">Custom Software Engineering</option>
                        <option value="web-development">Web Platform Development</option>
                        <option value="mobile-development">Mobile App Development</option>
                        <option value="cloud-devops">Cloud Infrastructure &amp; DevOps</option>
                        <option value="ai-integrations">AI Integration &amp; Automation</option>
                      </select>
                    </div>
                  </div>

                  {/* Client Permission Verification */}
                  <div className="p-3 rounded-xl bg-white border border-rule space-y-1.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.permissionGranted}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, permissionGranted: e.target.checked })
                        }
                        className="rounded border-rule text-emerald-700 focus:ring-emerald-600 mt-0.5"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-ink">Client Brand Disclosure Permission</span>
                        <p className="text-muted text-[11px] leading-relaxed">
                          Confirmed written agreement from the client to publish their real brand name publicly.
                        </p>
                      </div>
                    </label>

                    {!editingItem.permissionGranted && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                        <span>
                          <strong>Safety Guardrail Active:</strong> Because permission is unchecked, the public site will automatically anonymize this client as <em>"Unnamed multinational"</em>.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={editingItem.technologies || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, technologies: e.target.value })}
                      placeholder="Next.js, PostgreSQL, M-Pesa Daraja, Redis"
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-rule outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Service Specific Fields */}
              {type === "service" && (
                <div className="p-4 rounded-2xl bg-surface/50 border border-rule/80 space-y-3">
                  <label className="block text-xs font-semibold text-ink">Core Deliverables (one per line)</label>
                  <textarea
                    rows={3}
                    value={editingItem.deliverables || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, deliverables: e.target.value })}
                    placeholder="High-throughput microservices&#10;Offline sync architecture&#10;Core Web Vitals 95+ score"
                    className="w-full p-2.5 rounded-lg text-xs bg-white border border-rule outline-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. In-Use Protection Modal */}
      {inUseModal.open && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-800 pb-2 border-b border-rule">
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200">
                <Lock className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink">In-Use Protection Active</h3>
                <p className="text-xs text-muted">Cannot delete referenced content.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-body">
              <p>
                <strong>"{inUseModal.title}"</strong> is actively linked or referenced by other published content on SiroTech Solutions:
              </p>

              <div className="p-3.5 rounded-2xl bg-surface border border-rule/80 divide-y divide-rule/60 max-h-48 overflow-y-auto">
                {inUseModal.references.map((ref, idx) => (
                  <div key={idx} className="py-2 text-ink font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                    <span>{ref}</span>
                  </div>
                ))}
              </div>

              <p className="text-muted">
                To preserve site integrity and avoid broken navigation or missing deliverables, hard deletion is blocked. You may <strong>Archive</strong> this item instead to hide it safely from public listings.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setInUseModal({ open: false, slug: "", title: "", references: [] })}
                className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleArchiveItem(inUseModal.slug, inUseModal.title)}
                disabled={isPending}
                className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-amber-700 hover:bg-amber-600 transition shadow-xs flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Safely Instead</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal (When NOT in use) */}
      {deleteConfirmModal.open && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-700 pb-2 border-b border-rule">
              <div className="p-2.5 rounded-2xl bg-red-100 border border-red-200">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-ink">Confirm Deletion</h3>
                <p className="text-xs text-muted">Zero active dependencies detected.</p>
              </div>
            </div>

            <p className="text-xs text-body leading-relaxed">
              Are you sure you want to permanently delete <strong>"{deleteConfirmModal.title}"</strong> (/{deleteConfirmModal.slug})? This will remove the item from all catalogs.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ open: false, slug: "", title: "" })}
                className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-red-700 hover:bg-red-600 transition shadow-xs"
              >
                {isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
