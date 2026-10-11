"use client";

import React, { useEffect, useRef, useState } from "react";

export function StatBlock({
  value,
  prefix = "",
  suffix = "",
  label,
  duration = 1800,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasAnimated) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(easeOutProgress * value));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <div ref={containerRef} className={`flex flex-col py-6 md:py-0 ${className}`.trim()}>
      <div className="text-[4rem] sm:text-[5.5rem] lg:text-[7rem] font-bold text-ink leading-none tracking-tight tabular-nums select-none">
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted font-medium mt-3 tracking-wide">
        {label}
      </div>
    </div>
  );
}
