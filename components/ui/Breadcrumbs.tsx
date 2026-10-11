import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className = "",
  baseUrl = "https://sirotech.com",
}: {
  items: BreadcrumbItem[];
  className?: string;
  baseUrl?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Accessible Navigation UI */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs sm:text-sm font-medium ${className}`.trim()}
      >
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted opacity-60 shrink-0" />
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-ink font-semibold"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
