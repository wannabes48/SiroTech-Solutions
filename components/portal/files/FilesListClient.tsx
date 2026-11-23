"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { FileRow } from "@/components/portal/shared/FileRow";
import { EmptyState } from "@/components/portal/shared/EmptyState";
import { Toast } from "@/components/portal/shared/Toast";

interface FilesListClientProps {
  initialFiles: any[];
}

export function FilesListClient({ initialFiles }: FilesListClientProps) {
  const [category, setCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredFiles = initialFiles.filter((file) => {
    if (category !== "ALL" && file.kind !== category) return false;
    if (search.trim()) {
      return (
        file.name.toLowerCase().includes(search.toLowerCase()) ||
        file.kind.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-surface rounded-2xl border border-rule/80 w-fit overflow-x-auto">
          {["ALL", "DELIVERABLE", "DOCUMENT", "CONTRACT", "ASSET"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCategory(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                category === tab
                  ? "bg-white text-ink shadow-2xs font-bold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab === "ALL" ? "All Files" : tab.charAt(0) + tab.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface border border-rule text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {filteredFiles.length === 0 ? (
          <EmptyState
            title="No documents found"
            sentence="No files match your query. You can upload deliverables or architecture specs directly from the Project Hub."
          />
        ) : (
          filteredFiles.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onDownload={(f) => {
                const link = document.createElement("a");
                link.href = `/api/files/${f.id}`;
                link.setAttribute("download", f.name);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setToastMessage(`Downloading ${f.name} via secure route...`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
