import React from "react";

export type AdminStatusType =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "WON"
  | "LOST"
  | "PLANNING"
  | "DESIGN"
  | "BUILD"
  | "TESTING"
  | "LIVE"
  | "ON_HOLD"
  | "COMPLETE"
  | "DRAFT"
  | "IN_REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "DUE"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "VOID"
  | "REFUNDED"
  | "OPEN"
  | "WAITING_ON_CLIENT"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

interface AdminStatusPillProps {
  status: string;
  customLabel?: string;
  className?: string;
}

export function AdminStatusPill({ status, customLabel, className = "" }: AdminStatusPillProps) {
  const norm = (status || "").toUpperCase();

  let style = "bg-surface text-ink border-rule";
  let dotColor = "bg-muted";
  let label = customLabel || status;

  switch (norm) {
    case "WON":
    case "PAID":
    case "LIVE":
    case "COMPLETE":
    case "PUBLISHED":
    case "APPROVED":
    case "RESOLVED":
      style = "bg-emerald-50 text-emerald-800 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;

    case "NEW":
    case "AWAITING_APPROVAL":
    case "READY_FOR_APPROVAL":
    case "WAITING_ON_CLIENT":
    case "SCHEDULED":
    case "PROPOSAL":
    case "SENT":
    case "VIEWED":
      style = "bg-amber-50 text-amber-800 border-amber-200";
      dotColor = "bg-amber-500";
      break;

    case "CONTACTED":
    case "QUALIFIED":
    case "BUILD":
    case "TESTING":
    case "IN_PROGRESS":
    case "IN_REVIEW":
    case "DESIGN":
      style = "bg-sage-100 text-ink border-sage-300";
      dotColor = "bg-sage-700";
      break;

    case "LOST":
    case "OVERDUE":
    case "VOID":
    case "REFUNDED":
    case "CLOSED":
      style = "bg-rose-50 text-rose-800 border-rose-200";
      dotColor = "bg-rose-500";
      break;

    case "CHANGES_REQUESTED":
      style = "bg-rose-50 text-rose-800 border-rose-300 font-semibold";
      dotColor = "bg-rose-600 animate-pulse";
      break;

    case "DRAFT":
    case "ON_HOLD":
    case "ARCHIVED":
    case "PLANNING":
    default:
      style = "bg-surface text-muted border-rule";
      dotColor = "bg-muted";
      break;
  }

  // Format label nicely if not overridden
  if (!customLabel) {
    label = norm.replace(/_/g, " ").toLowerCase();
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
