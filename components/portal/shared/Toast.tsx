"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  type?: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export function Toast({
  type = "success",
  message,
  onClose,
  duration = 4000,
  className = "",
}: ToastProps) {
  useEffect(() => {
    if (!onClose || duration === 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: "bg-white border-emerald-300 text-emerald-950 shadow-emerald-700/10",
    error: "bg-white border-red-300 text-red-950 shadow-red-700/10",
    info: "bg-white border-blue-300 text-blue-950 shadow-blue-700/10",
  }[type];

  const iconColors = {
    success: "text-emerald-700 bg-emerald-50 border-emerald-200",
    error: "text-red-700 bg-red-50 border-red-200",
    info: "text-blue-700 bg-blue-50 border-blue-200",
  }[type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md ${styles} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${iconColors}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="leading-snug text-ink font-semibold">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-muted hover:text-ink transition-colors cursor-pointer shrink-0 ml-2"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

