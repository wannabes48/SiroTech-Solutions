import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "surface" | "white" | "subtle";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  variant = "white",
  padding = "md",
  ...props
}: CardProps) {
  const variantStyles = {
    white: "bg-white border border-rule/80 shadow-xs",
    surface: "bg-surface border border-rule shadow-xs",
    subtle: "bg-[#F8FAF9] border border-rule/60",
  }[variant];

  const paddingStyles = {
    none: "p-0",
    sm: "p-4 sm:p-5",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  }[padding];

  return (
    <div
      className={`rounded-3xl ${variantStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
