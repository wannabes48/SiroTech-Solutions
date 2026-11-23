import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  sentence: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ title, sentence, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border border-rule/80 bg-white p-8 sm:p-12 text-center shadow-xs ${className}`}
    >
      <div className="max-w-md mx-auto space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-ink">{title}</h3>
        <p className="text-xs sm:text-sm text-body leading-relaxed">{sentence}</p>

        {action && (
          <div className="pt-2">
            {action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
