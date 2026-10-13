"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Send, Loader2 } from "lucide-react";

export interface ComposerProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

const MAX_CHARS = 1000;
const WARNING_THRESHOLD = 800;

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  { disabled, onSend },
  ref
) {
  const [value, setValue] = useState("");
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

  // Auto-resize
  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.height = "auto";
      internalRef.current.style.height = `${Math.min(internalRef.current.scrollHeight, 100)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled && trimmed.length <= MAX_CHARS) {
      onSend(trimmed);
      setValue("");
      if (internalRef.current) {
        internalRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = value.length;
  const isNearLimit = charCount >= WARNING_THRESHOLD;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="p-3 bg-white border-t border-rule/80 shrink-0">
      <div className="relative flex items-end gap-2 bg-surface rounded-2xl p-1.5 border border-rule/80 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
        <textarea
          ref={internalRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS + 50) {
              setValue(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Assistant is replying..." : "Ask about our services, pricing, stack..."}
          className="flex-1 bg-transparent border-0 text-ink text-xs sm:text-sm placeholder:text-muted focus:outline-none resize-none max-h-24 py-1.5 px-2 leading-relaxed"
          aria-label="Ask SiroTech Assistant"
        />

        <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0">
          {isNearLimit && (
            <span
              className={`text-[10px] font-mono font-medium ${
                isOverLimit ? "text-red-600 font-bold" : "text-muted"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || value.trim().length === 0 || isOverLimit}
            className="w-8 h-8 rounded-full bg-[#1B2E24] text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label="Send message"
          >
            {disabled ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white/80" />
            ) : (
              <Send className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default Composer;
