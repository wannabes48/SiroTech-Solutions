"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShieldCheck, AlertCircle } from "lucide-react";
import { useAssistant } from "./useAssistant";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { QuickReplies } from "./QuickReplies";
import { Composer } from "./Composer";
import { Logo } from "@/components/brand/Logo";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

const NUDGE_KEY = "sirotech_assistant_nudged_v1";

export function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeText, setNudgeText] = useState("Questions about our pricing & services?");

  // Defer hydration until browser idle
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(() => setIsIdle(true), {
        timeout: 2000,
      });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setIsIdle(true), 800);
      return () => clearTimeout(id);
    }
  }, []);

  const { msgs, busy, degraded, send, reset, triggerShortcut } = useAssistant();
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
    trackAssistantEvent({ name: "assistant_close" });
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, close]);

  // Focus management
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        composerRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // 25-Second Nudge on /pricing and /services/*
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isPricingOrService = pathname === "/pricing" || pathname.startsWith("/services");
    if (!isPricingOrService) {
      setShowNudge(false);
      return;
    }

    const alreadyNudged = localStorage.getItem(NUDGE_KEY);
    if (alreadyNudged || open) {
      setShowNudge(false);
      return;
    }

    const text =
      pathname === "/pricing"
        ? "Questions about pricing or project tiers?"
        : "Looking for tailored engineering specs?";
    setNudgeText(text);

    const timer = setTimeout(() => {
      if (!open && !localStorage.getItem(NUDGE_KEY)) {
        setShowNudge(true);
      }
    }, 25_000);

    return () => clearTimeout(timer);
  }, [pathname, open]);

  const dismissNudge = useCallback(() => {
    setShowNudge(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(NUDGE_KEY, "true");
    }
  }, []);

  const openFromNudge = useCallback(() => {
    dismissNudge();
    setOpen(true);
    trackAssistantEvent({ name: "assistant_open" });
  }, [dismissNudge]);

  // Mobile focus trap
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length === 0) return;

    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }, []);

  // Exclude admin and portal pages
  const isExcluded = pathname?.startsWith("/portal") || pathname?.startsWith("/admin");

  if (isExcluded || !isIdle) {
    return null;
  }

  return (
    <>
      {/* 25-Second Contextual Nudge Speech Bubble */}
      {showNudge && !open && (
        <aside
          role="status"
          aria-label="Assistant suggestion"
          className="fixed bottom-22 right-4 md:bottom-24 md:right-6 z-50 w-64 p-3 bg-white rounded-2xl shadow-xl border border-rule animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={openFromNudge}
              className="text-left text-xs font-semibold text-ink hover:text-emerald-700 transition-colors leading-snug cursor-pointer"
            >
              {nudgeText}
              <span className="block text-[11px] text-muted font-normal mt-0.5">
                Chat with our assistant →
              </span>
            </button>
            <button
              type="button"
              onClick={dismissNudge}
              className="p-1 text-muted hover:text-ink rounded-full transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-rule rotate-45" />
        </aside>
      )}

      {/* Floating Launcher Button */}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          aria-label="Open chat assistant"
          aria-expanded={false}
          onClick={() => {
            setOpen(true);
            setShowNudge(false);
            trackAssistantEvent({ name: "assistant_open" });
          }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 grid size-14 place-items-center rounded-full bg-[#0D9463] text-white shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 group"
        >
          <div className="relative flex items-center justify-center">
            <Logo variant="mark-dark" className="w-7 h-7 drop-shadow-xs" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#1B2E24] border-2 border-white" />
          </div>
        </button>
      )}

      {/* Assistant Dialog Panel */}
      {open && (
        <section
          ref={dialogRef}
          role="dialog"
          aria-label="SiroTech assistant"
          aria-modal="true"
          onKeyDown={handleTabKey}
          className="fixed inset-0 z-50 flex flex-col bg-white md:inset-auto md:bottom-6 md:right-6 md:h-[560px] md:w-[380px] md:rounded-3xl md:shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-rule/80"
        >
          <Header onClose={close} onReset={reset} />

          {/* S11: Degraded Mode Top Banner */}
          {degraded && (
            <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2 text-[11px] text-amber-900 flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-medium">
                The assistant is unavailable. These shortcuts still work.
              </span>
            </div>
          )}

          <MessageList
            msgs={msgs}
            busy={busy}
            onSend={send}
            onNavigate={() => {
              if (window.innerWidth < 768) {
                close();
              }
            }}
          />
          <QuickReplies
            degraded={degraded}
            onPick={send}
            onShortcut={triggerShortcut}
            disabled={busy}
          />
          <Composer ref={composerRef} disabled={busy} onSend={send} />
          <div className="px-4 pb-3 pt-1 text-[11px] text-muted flex items-center justify-between border-t border-rule/40 bg-surface/30">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>AI assistant. Never share passwords or payment details.</span>
            </div>
            <Link
              href="/legal/privacy"
              className="underline text-muted hover:text-ink transition-colors shrink-0 ml-1.5"
            >
              Privacy
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

export default AssistantWidget;
