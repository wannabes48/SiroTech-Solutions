"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
  url: string;
  caption: string;
  tag: string;
}

export function WorkGallery({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className="group relative cursor-pointer overflow-hidden rounded-[24px] bg-surface border border-rule transition-all duration-300 hover:border-ink/30 hover:shadow-lg"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-sage-100 relative">
              <img
                src={item.url}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/30 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-11 h-11 rounded-full bg-white text-ink flex items-center justify-center shadow-md">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                {item.tag}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-ink line-clamp-2 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image & Caption */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[activeIndex].url}
              alt={items[activeIndex].caption}
              className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <div className="mt-4 text-center">
              <span className="text-xs uppercase tracking-widest text-sage-300 font-bold block mb-1">
                {items[activeIndex].tag} • {activeIndex + 1} of {items.length}
              </span>
              <p className="text-white text-sm sm:text-base font-medium max-w-xl">
                {items[activeIndex].caption}
              </p>
            </div>
          </div>

          {/* Right Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
