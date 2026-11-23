import { portalPath } from "@/lib/hosts";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FolderKanban,
  FileText,
  ReceiptText,
  LifeBuoy,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import {
  portalProjects,
  portalInvoices,
  supportTickets,
  sharedFiles,
} from "@/data/portal-data";

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  // Search projects
  const matchingProjects = portalProjects
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      type: "project" as const,
      title: p.title,
      subtitle: `Target: ${p.targetLaunch} &bull; ${p.status}`,
      href: portalPath(`/projects/${p.id}`),
      icon: FolderKanban,
    }));

  // Search invoices
  const matchingInvoices = portalInvoices
    .filter((i) => !q || i.invoiceNumber.toLowerCase().includes(q) || i.projectTitle.toLowerCase().includes(q))
    .slice(0, 3)
    .map((i) => ({
      id: i.id,
      type: "invoice" as const,
      title: `${i.invoiceNumber} - KES ${i.amountKES.toLocaleString()}`,
      subtitle: `${i.projectTitle} &bull; Due ${i.dueDate}`,
      href: portalPath(`/invoices/${i.id}`),
      icon: ReceiptText,
    }));

  // Search tickets
  const matchingTickets = supportTickets
    .filter((t) => !q || t.ticketNumber.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
    .slice(0, 3)
    .map((t) => ({
      id: t.id,
      type: "ticket" as const,
      title: `${t.ticketNumber}: ${t.subject}`,
      subtitle: `Priority: ${t.priority} &bull; ${t.status}`,
      href: portalPath(`/support/${t.id}`),
      icon: LifeBuoy,
    }));

  // Search files
  const matchingFiles = sharedFiles
    .filter((f) => !q || f.name.toLowerCase().includes(q) || f.kind.toLowerCase().includes(q))
    .slice(0, 3)
    .map((f) => ({
      id: f.id,
      type: "file" as const,
      title: f.name,
      subtitle: `${f.kind} &bull; ${f.size}`,
      href: portalPath(`/projects/coastlane-core-v2?tab=files`),
      icon: FileText,
    }));

  const allResults = [
    ...matchingProjects,
    ...matchingInvoices,
    ...matchingTickets,
    ...matchingFiles,
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      router.push(allResults[selectedIndex].href);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search client portal"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-rule shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-rule/80">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search projects, invoices, tickets, and files..."
            className="w-full bg-transparent border-0 text-sm font-medium text-ink placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-muted bg-surface border border-rule rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              No portal records found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {matchingProjects.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Projects
                  </div>
                  <div className="space-y-1">
                    {matchingProjects.map((item) => {
                      const Icon = item.icon;
                      const isSelected = allResults[selectedIndex]?.id === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                            isSelected ? "bg-sage-100 text-ink" : "hover:bg-surface text-ink"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div
                                className="text-[11px] text-muted truncate"
                                dangerouslySetInnerHTML={{ __html: item.subtitle }}
                              />
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchingInvoices.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Invoices &amp; Billing
                  </div>
                  <div className="space-y-1">
                    {matchingInvoices.map((item) => {
                      const Icon = item.icon;
                      const isSelected = allResults[selectedIndex]?.id === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                            isSelected ? "bg-sage-100 text-ink" : "hover:bg-surface text-ink"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div className="text-[11px] text-muted truncate">{item.subtitle}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchingTickets.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Support Tickets
                  </div>
                  <div className="space-y-1">
                    {matchingTickets.map((item) => {
                      const Icon = item.icon;
                      const isSelected = allResults[selectedIndex]?.id === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                            isSelected ? "bg-sage-100 text-ink" : "hover:bg-surface text-ink"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div className="text-[11px] text-muted truncate">{item.subtitle}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {matchingFiles.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Shared Files &amp; Deliverables
                  </div>
                  <div className="space-y-1">
                    {matchingFiles.map((item) => {
                      const Icon = item.icon;
                      const isSelected = allResults[selectedIndex]?.id === item.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${
                            isSelected ? "bg-sage-100 text-ink" : "hover:bg-surface text-ink"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-rule flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div className="text-[11px] text-muted truncate">{item.subtitle}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 bg-[#F8FAF9] border-t border-rule/80 flex items-center justify-between text-[11px] text-muted">
          <span>Navigation Shortcuts:</span>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-rule rounded">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-rule rounded">↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
