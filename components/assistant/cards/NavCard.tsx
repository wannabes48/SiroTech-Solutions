"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

export interface NavCardProps {
  path: string;
  label: string;
  onNavigate?: () => void;
}

export function NavCard({ path, label, onNavigate }: NavCardProps) {
  const handleClick = () => {
    trackAssistantEvent({ name: "assistant_nav_click", path });
    onNavigate?.();
  };

  return (
    <div className="my-2 rounded-2xl bg-white border border-rule/80 p-3 shadow-2xs hover:border-sage-300 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center text-sage-800 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-ink truncate">{label}</span>
        </div>
        <Link
          href={path}
          onClick={handleClick}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-rule hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-xs font-semibold text-ink transition-all group shrink-0"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default NavCard;
