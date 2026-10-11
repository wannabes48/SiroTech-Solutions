"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({
  children,
  className = "",
  itemWidth = 380,
}: {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollOffset = direction === "left" ? -itemWidth : itemWidth;
    el.scrollBy({ left: scrollOffset, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByAmount("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByAmount("right");
    }
  };

  return (
    <div className={`relative group ${className}`.trim()}>
      {/* Scrollable Container with Snap */}
      <div
        ref={scrollContainerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Image and content carousel"
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 pt-2 -mx-6 px-6 lg:mx-0 lg:px-0 focus-visible:outline-2 focus-visible:outline-sage-500 focus-visible:outline-offset-4 rounded-2xl scroll-smooth select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {React.Children.map(children, (child, idx) => (
          <div key={idx} className="snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Prev / Next Floating Navigation Controls */}
      <div className="flex items-center gap-3 mt-6 justify-end">
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          disabled={!canScrollLeft}
          aria-label="Previous slide"
          className="w-11 h-11 rounded-full border border-rule bg-surface text-ink flex items-center justify-center hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          disabled={!canScrollRight}
          aria-label="Next slide"
          className="w-11 h-11 rounded-full border border-rule bg-surface text-ink flex items-center justify-center hover:bg-ink hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
