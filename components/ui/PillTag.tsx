import React from "react";

export function PillTag({
  children,
  variant = "sage",
  className = "",
  icon,
}: {
  children: React.ReactNode;
  variant?: "sage" | "dark" | "outline" | "white";
  className?: string;
  icon?: React.ReactNode;
}) {
  const styles = {
    sage: "bg-sage-100 text-sage-700 border border-sage-300/60",
    dark: "bg-ink text-white",
    outline: "border border-rule text-ink bg-surface",
    white: "bg-white text-ink shadow-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[variant]} ${className}`.trim()}
    >
      {icon}
      {children}
    </span>
  );
}
