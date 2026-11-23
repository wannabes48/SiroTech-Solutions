"use client";

import React, { useState, useTransition } from "react";
import { saveContentItemAction } from "@/app/admin/actions";
import { Loader2, Check, X, Shield, Sparkles } from "lucide-react";

export interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  initialData?: {
    slug: string;
    title: string;
    summary?: string;
    content?: any;
    status: string;
    seoTitle?: string;
    seoDesc?: string;
  };
}

export function ContentEditorModal({
  isOpen,
  onClose,
  type,
  initialData
}: ContentEditorModalProps) {
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(initialData?.seoDesc || "");

  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    startTransition(async () => {
      const res = await saveContentItemAction({
        type,
        slug,
        title,
        summary,
        status,
        seoTitle,
        seoDesc
      });
      if (res?.success) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-rule my-8 space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-rule/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-ink">
              {initialData ? `Edit ${initialData.title}` : `New ${type}`}
            </h3>
            <span className="text-xs text-muted font-mono uppercase">Type: {type}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs font-mono text-ink focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Summary / Lead Paragraph</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-rule text-xs text-ink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rule/60">
            <div>
              <label className="block font-semibold text-ink mb-1">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink font-semibold"
              >
                <option value="PUBLISHED">Published (Live within seconds)</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-rule/60 space-y-3">
            <span className="font-bold text-ink block">SEO Metadata</span>
            <div>
              <label className="block text-muted mb-1">SERP Title Tag</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Page Title | SiroTech Solutions"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink"
              />
            </div>
            <div>
              <label className="block text-muted mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Summary snippet displayed in search results..."
                className="w-full p-2.5 rounded-xl bg-surface border border-rule text-xs text-ink"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-rule/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs text-muted hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save &amp; Revalidate Cache</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
