"use client";

import { useEffect, useRef, useState } from "react";

export function StatBlock({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setN(value);

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - t0) / 1200, 1);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    if (ref.current) {
      io.observe(ref.current);
    }
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="py-6 md:py-0">
      <div className="text-[clamp(4rem,8vw,7rem)] font-medium tabular-nums leading-none text-ink tracking-tight select-none">
        {n}
        {suffix}
      </div>
      <p className="mt-3 text-muted text-sm font-medium leading-relaxed max-w-xs">
        {label}
      </p>
    </div>
  );
}
