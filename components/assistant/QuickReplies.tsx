"use client";

import React from "react";
import { DegradedShortcut } from "./useAssistant";

export interface QuickRepliesProps {
  degraded?: boolean;
  onPick: (text: string) => void;
  onShortcut?: (shortcut: DegradedShortcut) => void;
  disabled?: boolean;
}

const NORMAL_CHIPS = [
  { label: "Our services", text: "What services do you offer?" },
  { label: "Pricing & plans", text: "What are your published plans and pricing?" },
  { label: "Start a project", text: "I'd like to get a quote and start a project." },
  { label: "Talk to a human", text: "Can I speak to an engineer or book a call?" },
];

const DEGRADED_SHORTCUTS: { label: string; shortcut: DegradedShortcut }[] = [
  { label: "Services", shortcut: "services" },
  { label: "Pricing", shortcut: "pricing" },
  { label: "FAQ", shortcut: "faq" },
  { label: "Start a project", shortcut: "project" },
  { label: "Contact us", shortcut: "contact" },
  { label: "Talk to a human", shortcut: "human" },
];

export function QuickReplies({
  degraded,
  onPick,
  onShortcut,
  disabled,
}: QuickRepliesProps) {
  if (degraded) {
    return (
      <div
        className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-rule/60 bg-amber-50/40"
        role="group"
        aria-label="Offline shortcut direct cards"
      >
        {DEGRADED_SHORTCUTS.map((chip) => (
          <button
            key={chip.shortcut}
            type="button"
            disabled={disabled}
            onClick={() => onShortcut?.(chip.shortcut)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-ink hover:text-emerald-800 text-[11px] font-semibold border border-rule/80 hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-2xs"
          >
            {chip.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="px-3 py-1.5 flex flex-wrap gap-1.5 border-t border-rule/40 bg-surface/40"
      role="group"
      aria-label="Quick reply suggestions"
    >
      {NORMAL_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(chip.text)}
          className="px-2.5 py-1 rounded-full bg-white hover:bg-sage-100 text-ink text-[11px] font-medium border border-rule/80 hover:border-sage-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export default QuickReplies;
