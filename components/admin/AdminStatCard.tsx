import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface AdminStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "success" | "danger";
}

export function AdminStatCard({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = "default"
}: AdminStatCardProps) {
  const borderStyles = {
    default: "border-rule/80 hover:border-rule",
    warning: "border-amber-200 bg-amber-50/20",
    success: "border-emerald-200 bg-emerald-50/20",
    danger: "border-rose-200 bg-rose-50/20"
  };

  return (
    <div className={`p-6 rounded-3xl bg-white border ${borderStyles[variant]} shadow-xs transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-surface border border-rule/60 flex items-center justify-center text-ink/70">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">
          {value}
        </div>
        {(subValue || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center font-semibold ${
                  trend.isPositive ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {subValue && <span className="text-muted">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
