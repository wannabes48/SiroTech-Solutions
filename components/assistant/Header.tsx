"use client";

import React from "react";
import { RotateCcw, X, Minus } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export interface HeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export function Header({ onClose, onReset }: HeaderProps) {
  return (
    <div className="bg-[#1B2E24] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 border-b border-white/10 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
          <Logo variant="mark-dark" className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>SiroTech Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </h3>
          <p className="text-[11px] text-white/70">Online • Answers from site content</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          title="Start fresh conversation"
          aria-label="New conversation"
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Close assistant"
          aria-label="Close assistant"
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Header;
