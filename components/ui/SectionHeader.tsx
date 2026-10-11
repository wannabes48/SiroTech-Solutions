import React from "react";

export function SectionHeader({
  label,
  heading,
  description,
  action,
  align = "left",
  className = "",
  dark = false,
}: {
  label?: string;
  heading: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
}) {
  if (align === "center") {
    return (
      <div className={`text-center max-w-3xl mx-auto mb-16 ${className}`.trim()}>
        {label && (
          <span
            className={`text-xs font-bold uppercase tracking-widest mb-3 inline-block ${
              dark ? "text-sage-300" : "text-muted"
            }`}
          >
            {label}
          </span>
        )}
        <h2 className={`text-h2 ${dark ? "text-white" : "text-ink"} mb-4`}>
          {heading}
        </h2>
        {description && (
          <p
            className={`text-base sm:text-lg leading-relaxed ${
              dark ? "text-white/80" : "text-body"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 ${className}`.trim()}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 max-w-2xl">
        {label && (
          <span
            className={`text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap sm:mt-2.5 ${
              dark ? "text-sage-300" : "text-muted"
            }`}
          >
            {label}
          </span>
        )}
        <h2 className={`text-h2 ${dark ? "text-white" : "text-ink"}`}>
          {heading}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:max-w-md">
        {description && (
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              dark ? "text-white/80" : "text-body"
            }`}
          >
            {description}
          </p>
        )}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
