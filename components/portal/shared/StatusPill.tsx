import React from "react";
import { Clock, CheckCircle2, AlertCircle, RefreshCw, PauseCircle } from "lucide-react";
import { PlainStatus } from "@/data/portal-data";

export interface StatusPillProps {
  status: PlainStatus | "On hold" | string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Status pill colours paired with text:
 * Waiting for you = amber tint
 * In progress = sage
 * Done/Paid = emerald
 * Overdue = red tint
 * On hold = grey
 */
export function StatusPill({ status, className = "", size = "md" }: StatusPillProps) {
  const norm = (status || "").toLowerCase();

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  if (norm.includes("waiting") || norm === "waiting for you") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs ${sizeClasses} ${className}`}
      >
        <Clock className={size === "sm" ? "w-2.5 h-2.5 text-amber-600" : "w-3 h-3 text-amber-600"} />
        <span>Waiting for you</span>
      </span>
    );
  }

  if (norm.includes("progress") || norm === "in progress") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-sage-100 text-sage-900 border border-sage-300 shadow-2xs ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sage-700 animate-pulse" />
        <span>In progress</span>
      </span>
    );
  }

  if (norm.includes("done") || norm.includes("paid") || norm.includes("approved") || norm === "live") {
    const label = norm.includes("paid") ? "Paid" : "Done";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs ${sizeClasses} ${className}`}
      >
        <CheckCircle2 className={size === "sm" ? "w-2.5 h-2.5 text-emerald-600" : "w-3 h-3 text-emerald-600"} />
        <span>{label}</span>
      </span>
    );
  }

  if (norm.includes("overdue")) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-red-50 text-red-800 border border-red-200/90 shadow-2xs ${sizeClasses} ${className}`}
      >
        <AlertCircle className={size === "sm" ? "w-2.5 h-2.5 text-red-600" : "w-3 h-3 text-red-600"} />
        <span>Overdue</span>
      </span>
    );
  }

  if (norm.includes("hold") || norm === "on hold") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-gray-100 text-gray-700 border border-gray-200/90 shadow-2xs ${sizeClasses} ${className}`}
      >
        <PauseCircle className={size === "sm" ? "w-2.5 h-2.5 text-gray-500" : "w-3 h-3 text-gray-500"} />
        <span>On hold</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-surface text-ink border border-rule shadow-2xs ${sizeClasses} ${className}`}
    >
      <span>{status}</span>
    </span>
  );
}
