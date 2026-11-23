"use client";

import React, { useState, useTransition } from "react";
import {
  Image as ImageIcon,
  Copy,
  Check,
  UploadCloud,
  Info,
  Trash2,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Plus,
  ShieldAlert
} from "lucide-react";
import { uploadMediaAction, deleteMediaAction } from "@/app/admin/actions";

export interface MediaItem {
  id?: string;
  key: string;
  url: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  title?: string;
  folder?: string;
}

export function MediaLibraryClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("ALL");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form State
  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newFolder, setNewFolder] = useState("general");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    showToast("Direct URL copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newUrl.trim() || !newAlt.trim()) return;

    startTransition(async () => {
      const res = await uploadMediaAction({
        key: newKey.trim(),
        title: newTitle.trim() || newKey.trim(),
        url: newUrl.trim(),
        alt: newAlt.trim(),
        folder: newFolder,
        mime: newUrl.endsWith(".svg") ? "image/svg+xml" : "image/jpeg",
        size: 142000,
        width: 1200,
        height: 800
      });

      if (res?.error) {
        showToast(`Upload blocked: ${res.error}`);
      } else {
        showToast(`Asset "${newKey}" indexed in Media Vault.`);
        setMediaList([
          {
            key: newKey.trim(),
            title: newTitle.trim() || newKey.trim(),
            url: newUrl.trim(),
            alt: newAlt.trim(),
            folder: newFolder,
            mime: newUrl.endsWith(".svg") ? "image/svg+xml" : "image/jpeg",
            size: 142000,
            width: 1200,
            height: 800
          },
          ...mediaList
        ]);
        setNewKey("");
        setNewTitle("");
        setNewUrl("");
        setNewAlt("");
        setUploadModalOpen(false);
      }
    });
  };

  const handleDelete = (key: string, title?: string) => {
    if (!confirm(`Permanently delete media asset "${title || key}"?`)) return;

    startTransition(async () => {
      const res = await deleteMediaAction(key);
      if (res?.error) {
        showToast(`Delete blocked: ${res.error}`);
      } else {
        showToast(`Asset "${key}" deleted.`);
        setMediaList((prev) => prev.filter((m) => m.key !== key));
      }
    });
  };

  const filtered = mediaList.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      m.alt.toLowerCase().includes(search.toLowerCase());

    const matchesFolder = selectedFolder === "ALL" || (m.folder || "general").toLowerCase() === selectedFolder.toLowerCase();

    return matchesSearch && matchesFolder;
  });

  const folders = ["ALL", ...Array.from(new Set(mediaList.map((m) => m.folder || "general")))];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Upload Warning / Accessibility Policy */}
      <div className="p-4 rounded-2xl bg-surface/70 border border-rule/70 flex items-start gap-3 text-xs text-body">
        <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          <strong className="text-ink">Accessibility &amp; SEO Policy:</strong> Every uploaded asset requires meaningful descriptive alt text explaining the diagram or interface for screen readers. Deletions are guarded by in-use dependency checks.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Folder filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {folders.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFolder(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                selectedFolder === f
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white border border-rule text-muted hover:text-ink hover:bg-surface/50"
              }`}
            >
              {f} ({f === "ALL" ? mediaList.length : mediaList.filter((m) => (m.folder || "general").toLowerCase() === f.toLowerCase()).length})
            </button>
          ))}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-rule text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center rounded-xl border border-rule bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid" ? "bg-surface text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "list" ? "bg-surface text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#1B2E24] hover:bg-black text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.key}
                className="rounded-3xl bg-white border border-rule/80 overflow-hidden shadow-xs hover:border-emerald-600/50 transition-all flex flex-col justify-between"
              >
                <div className="h-44 bg-surface/60 relative overflow-hidden flex items-center justify-center p-2">
                  {item.mime.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted" />
                  )}
                </div>

                <div className="p-4 space-y-2 text-xs border-t border-rule/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink truncate">{item.title || item.key}</span>
                    <span className="text-[10px] text-muted font-mono">
                      {(Number(item.size || 0) / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <div className="text-[11px] text-muted line-clamp-2 leading-normal">
                    <strong className="text-ink">Alt text:</strong> {item.alt}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-rule/40 text-[11px]">
                    <span className="font-mono text-muted">{item.width} &times; {item.height}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.url, item.key)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface hover:bg-sage-100 text-ink border border-rule/70 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span className="text-emerald-800">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.key, item.title)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-muted hover:text-red-700 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-muted">
              No media items found matching current filters.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-rule/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/60 border-b border-rule/60 text-muted uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Preview &amp; Title</th>
                  <th className="py-3 px-6">Required Alt Text</th>
                  <th className="py-3 px-6">Folder</th>
                  <th className="py-3 px-6">Dimensions / Size</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filtered.map((item) => (
                  <tr key={item.key} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-rule overflow-hidden flex items-center justify-center shrink-0">
                          <img src={item.url} alt={item.alt} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-ink block">{item.title || item.key}</span>
                          <span className="font-mono text-[10px] text-muted">{item.key}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-muted max-w-xs truncate">{item.alt}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface border border-rule text-muted">
                        {item.folder || "general"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-muted font-mono text-[11px]">
                      {item.width}&times;{item.height} &bull; {(Number(item.size || 0) / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.url, item.key)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface hover:bg-sage-100 text-ink border border-rule"
                        >
                          Copy URL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.key, item.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-rule shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <div>
                <h3 className="font-bold text-base text-ink">Upload Media Asset</h3>
                <p className="text-xs text-muted">Index an image with required WCAG accessibility metadata.</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-muted hover:text-ink text-sm font-semibold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Asset Key / Slug</label>
                <input
                  type="text"
                  placeholder="e.g. hero-dashboard-preview"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Human Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dashboard Staging Interface"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Asset URL or Storage Location</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... or /images/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Folder Taxonomy</label>
                <select
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule font-medium outline-none"
                >
                  <option value="brand">brand</option>
                  <option value="architecture">architecture</option>
                  <option value="case-studies">case-studies</option>
                  <option value="team">team</option>
                  <option value="general">general</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-ink">
                    Mandatory Alt Text <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-muted">WCAG 2.1 AA Required</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Describe the image content and purpose for vision-impaired users and search engines..."
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface border border-rule outline-none focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-rule text-xs font-semibold text-body hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newAlt.trim()}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Indexing..." : "Index Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
