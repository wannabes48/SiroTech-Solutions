import React from "react";

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  }[size];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-ink">{label}</span>}
          {showPercentage && <span className="font-bold text-emerald-700">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface rounded-full ${heightClasses} overflow-hidden border border-rule/50`}>
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
