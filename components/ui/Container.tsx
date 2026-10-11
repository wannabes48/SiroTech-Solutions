import React from "react";

export function Container({
  children,
  className = "",
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <Component className={`max-w-[1248px] mx-auto px-6 lg:px-10 ${className}`.trim()}>
      {children}
    </Component>
  );
}
