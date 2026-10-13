"use client";

import React, { useState } from "react";
import { Link2, Check, Share2, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Canonical production URL is strictly deterministic between server SSR and client hydration
  const canonicalUrl = `https://sirotech.com/blog/${slug}`;
  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      const urlToCopy =
        typeof window !== "undefined" ? window.location.href : canonicalUrl;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Failed to copy link", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1 hidden sm:inline">
        Share:
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
          copied
            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
            : "bg-white text-ink border-rule hover:border-ink hover:bg-sage-50"
        }`}
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* WhatsApp Share */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white border border-rule flex items-center justify-center text-muted hover:text-emerald-600 hover:border-emerald-400 transition-colors"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </a>

      {/* LinkedIn Share */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white border border-rule flex items-center justify-center text-muted hover:text-blue-600 hover:border-blue-400 transition-colors font-bold text-xs"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        in
      </a>

      {/* X / Twitter Share */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white border border-rule flex items-center justify-center text-muted hover:text-ink hover:border-ink transition-colors font-bold text-xs"
        title="Share on X"
        aria-label="Share on X"
      >
        𝕏
      </a>
    </div>
  );
}
