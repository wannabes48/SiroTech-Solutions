import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: {
    text: string;
    variant?: "emerald" | "amber" | "sage" | "neutral";
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  badge,
  icon: Icon,
  className = "",
}: StatCardProps) {
  const badgeColors = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    sage: "bg-sage-100 text-sage-900 border-sage-300",
    neutral: "bg-surface text-ink border-rule",
  }[badge?.variant || "sage"];

  return (
    <Card padding="sm" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-muted tracking-tight">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-surface border border-rule/70 flex items-center justify-center text-ink shrink-0">
            <Icon className="w-4 h-4 text-emerald-700" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2E24]">{value}</div>
        {(subtext || badge) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {badge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColors}`}>
                {badge.text}
              </span>
            )}
            {subtext && <span className="text-[11px] text-body">{subtext}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
