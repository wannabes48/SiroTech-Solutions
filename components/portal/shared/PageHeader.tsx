"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Plus,
  FolderKanban,
  Download,
  Check,
} from "lucide-react";

export type IconType =
  | React.ComponentType<{ className?: string }>
  | "calendar"
  | "plus"
  | "folder"
  | "download"
  | "check"
  | "arrow"
  | string;

export interface PageHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: IconType;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;
  className?: string;
}

function renderActionIcon(icon?: IconType) {
  if (!icon) return null;
  if (typeof icon === "string") {
    switch (icon) {
      case "calendar":
        return <Calendar className="w-3.5 h-3.5" />;
      case "plus":
        return <Plus className="w-3.5 h-3.5" />;
      case "folder":
        return <FolderKanban className="w-3.5 h-3.5" />;
      case "download":
        return <Download className="w-3.5 h-3.5" />;
      case "check":
        return <Check className="w-3.5 h-3.5" />;
      case "arrow":
        return <ArrowRight className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  }
  const IconComponent = icon;
  return <IconComponent className="w-3.5 h-3.5" />;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryAction,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2E24]">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-100 text-sage-900 border border-sage-300">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-body leading-relaxed">{subtitle}</p>}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {renderActionIcon(secondaryAction.icon)}
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2 rounded-full border border-rule hover:bg-surface text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {renderActionIcon(secondaryAction.icon)}
                <span>{secondaryAction.label}</span>
              </button>
            ))}

          {primaryAction &&
            (primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>{primaryAction.label}</span>
                {primaryAction.icon ? (
                  renderActionIcon(primaryAction.icon)
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>{primaryAction.label}</span>
                {primaryAction.icon ? (
                  renderActionIcon(primaryAction.icon)
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
