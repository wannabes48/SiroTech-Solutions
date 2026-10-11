import React from "react";

export function Section({
  children,
  className = "",
  id,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "surface" | "sage" | "ink";
}) {
  const bgColors = {
    default: "bg-bg",
    surface: "bg-surface border-y border-rule",
    sage: "bg-sage-700 text-white",
    ink: "bg-ink text-white",
  };

  return (
    <section id={id} className={`py-20 lg:py-28 ${bgColors[variant]} ${className}`.trim()}>
      {children}
    </section>
  );
}
