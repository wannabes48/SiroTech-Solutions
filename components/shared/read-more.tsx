import Link from "next/link";
import React from "react";

export function ReadMore({
  href,
  label = "Read More",
  onClick,
  className = "",
}: {
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <span className="grid size-10 place-items-center rounded-full bg-ink text-white font-medium transition-transform duration-300 group-hover:rotate-90 select-none">
        +
      </span>
      <span className="font-medium text-ink transition-colors group-hover:text-sage-700">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`group inline-flex items-center gap-3 text-sm text-ink ${className}`.trim()}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-3 text-sm text-ink cursor-pointer ${className}`.trim()}
    >
      {content}
    </button>
  );
}
