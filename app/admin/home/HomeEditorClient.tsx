"use client";

import { mainUrl } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "@/app/admin/actions";
import { Loader2, Check, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

export function HomeEditorClient({ settings }: { settings: any }) {
  const [headline, setHeadline] = useState(settings.headline || "Engineering high-load digital systems and bespoke software.");
  const [tagline, setTagline] = useState(settings.tagline || "Software & Systems Engineering Studio");
  const [blurb, setBlurb] = useState(
    settings.blurb ||
      "An independent software engineering studio based in Nairobi. We build scalable web platforms, offline-first mobile apps, and robust enterprise integrations."
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    startTransition(async () => {
      const res = await updateSiteSettingsAction("general", {
        ...settings,
        headline,
        tagline,
        blurb
      });
      if (res?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rule/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-rule/60 pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Hero Section Copy</h2>
            <p className="text-xs text-muted">Primary typography and positioning displayed above the fold.</p>
          </div>
          <Link
            href={mainUrl()}
            target="_blank"
            className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
          >
            <span>Preview Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1.5">Tagline &amp; Category Pill</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1.5">Primary Hero Headline (H1)</label>
            <textarea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1.5">Two-line Studio Description</label>
            <textarea
              rows={3}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-rule/60">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Homepage content published live
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>
    </form>
  );
}
