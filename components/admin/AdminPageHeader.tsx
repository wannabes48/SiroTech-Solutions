"use client";

import { adminPath } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger";
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  breadcrumbs,
  badge,
  badgeVariant = "default",
  primaryAction,
  secondaryAction,
  children
}: AdminPageHeaderProps) {
  const badgeClasses = {
    default: "bg-surface text-ink border border-rule",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-rose-50 text-rose-800 border border-rose-200"
  };

  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted mb-2.5">
          <Link href={adminPath()} className="hover:text-ink transition-colors">
            Control Room
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-ink transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">
              {title}
            </h1>
            {badge && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClasses[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-body leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {children}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rule hover:bg-surface text-ink transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}

          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1B2E24] hover:bg-black text-white transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
