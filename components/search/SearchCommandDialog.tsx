"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, ArrowRight, CornerDownLeft, Layers, Briefcase, BookOpen, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchCommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { label: "Engineering Services", href: "/services", icon: Layers },
  { label: "Case Studies & Proof", href: "/work", icon: Briefcase },
  { label: "Architecture Blog", href: "/blog", icon: BookOpen },
  { label: "Frequently Asked Questions", href: "/faq", icon: HelpCircle },
];

const popularTerms = [
  "M-Pesa Daraja",
  "Next.js",
  "Offline-First",
  "ERP Engine",
  "FinTech",
  "PostgreSQL",
];

export function SearchCommandDialog({ isOpen, onClose }: SearchCommandDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectTerm = (term: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-rule overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="flex items-center px-6 py-4.5 border-b border-rule gap-3">
              <Search className="w-5 h-5 text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, case studies, guides, FAQ..."
                className="w-full text-base text-ink placeholder:text-muted bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full text-muted hover:text-ink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors shrink-0 inline-flex items-center gap-1.5"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Popular Search Suggestions */}
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sage-700" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectTerm(term)}
                      className="px-3.5 py-1.5 rounded-full bg-surface hover:bg-sage-100 text-xs font-semibold text-ink transition-colors border border-rule hover:border-sage-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Destinations */}
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">
                  Quick Navigation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.label}
                        type="button"
                        onClick={() => handleNavigate(link.href)}
                        className="p-3 rounded-2xl bg-surface/60 hover:bg-surface border border-rule/80 hover:border-rule text-left flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sage-200 text-sage-800 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-ink group-hover:text-sage-800 transition-colors">
                            {link.label}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-ink transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="px-6 py-3 bg-surface border-t border-rule text-[11px] text-muted flex items-center justify-between">
              <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded-xs border border-rule text-ink">Esc</kbd> to exit</span>
              <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded-xs border border-rule text-ink">Enter</kbd> to search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
