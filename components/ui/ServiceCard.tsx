import React, { ElementType } from "react";
import { ReadMore } from "@/components/shared/read-more";

export function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
  isHovered = false,
  className = "",
}: {
  icon: ElementType;
  title: string;
  description: string;
  href: string;
  isHovered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface rounded-[24px] p-8 border transition-all duration-300 group flex flex-col justify-between ${
        isHovered
          ? "border-rule shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] -translate-y-1"
          : "border-transparent hover:border-rule hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1"
      } ${className}`.trim()}
    >
      <div>
        <div className="w-12 h-12 rounded-full bg-sage-300 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
          <Icon className="w-5 h-5 text-sage-700" />
        </div>
        <h3 className="font-semibold text-ink text-xl mb-3 leading-snug">
          {title}
        </h3>
        <p className="text-body text-sm leading-relaxed line-clamp-3 mb-8">
          {description}
        </p>
      </div>

      <ReadMore href={href} />
    </div>
  );
}
