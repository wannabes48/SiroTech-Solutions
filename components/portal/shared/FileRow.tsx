"use client";

import React from "react";
import { FileText, Download, Eye, FileCode, FileArchive, Shield } from "lucide-react";
import { ProjectFile } from "@/data/portal-data";

export interface FileRowProps {
  file: ProjectFile;
  onPreview?: (file: ProjectFile) => void;
  onDownload?: (file: ProjectFile) => void;
  className?: string;
}

export function FileRow({ file, onPreview, onDownload, className = "" }: FileRowProps) {
  const getFileIcon = (name: string, kind: string) => {
    if (name.endsWith(".pdf")) return <FileText className="w-4 h-4 text-red-600" />;
    if (name.endsWith(".json") || name.endsWith(".ts")) return <FileCode className="w-4 h-4 text-emerald-600" />;
    if (name.endsWith(".zip") || name.endsWith(".tar")) return <FileArchive className="w-4 h-4 text-amber-600" />;
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const isPreviewable =
    file.name.endsWith(".pdf") ||
    file.name.endsWith(".json") ||
    file.name.endsWith(".png") ||
    file.name.endsWith(".jpg");

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      const link = document.createElement("a");
      link.href = `/api/files/${file.id}`;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-white border border-rule/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-surface border border-rule/80 flex items-center justify-center shrink-0">
          {getFileIcon(file.name, file.kind)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-ink truncate hover:text-emerald-700 transition-colors">
            {file.name}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
            <span className="font-semibold text-emerald-800">{file.kind}</span>
            <span>&bull;</span>
            <span>{file.size}</span>
            <span>&bull;</span>
            <span>Uploaded {file.uploadedAt}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {isPreviewable && (
          <button
            type="button"
            onClick={() => onPreview && onPreview(file)}
            className="px-3 py-1.5 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Preview file"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="Download signed copy"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
