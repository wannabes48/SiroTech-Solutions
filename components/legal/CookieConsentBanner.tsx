"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Sliders, Check, X, ChevronRight, Lock } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "sirotech_cookie_consent_v1";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    functional: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has already been saved
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences({
          necessary: true,
          analytics: parsed.analytics ?? false,
          functional: parsed.functional ?? false,
          marketing: parsed.marketing ?? false,
        });
        setIsVisible(false);
      } else {
        // Show after a brief delay for optimal page load UX
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Allow reopening from footer or any button via custom event
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsCustomizing(true);
      setIsVisible(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const saveConsent = (prefs: {
    analytics: boolean;
    functional: boolean;
    marketing: boolean;
  }) => {
    const payload: CookiePreferences = {
      necessary: true,
      analytics: prefs.analytics,
      functional: prefs.functional,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not save cookie consent to localStorage", e);
    }

    setPreferences({
      necessary: true,
      analytics: prefs.analytics,
      functional: prefs.functional,
      marketing: prefs.marketing,
    });
    setIsVisible(false);
    setIsCustomizing(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      functional: true,
      marketing: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      analytics: false,
      functional: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent({
      analytics: preferences.analytics,
      functional: preferences.functional,
      marketing: preferences.marketing,
    });
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-ink/95 backdrop-blur-md text-white border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-ink/40">
        {!isCustomizing ? (
          /* Overview View */
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sage-300/15 border border-sage-300/30 flex items-center justify-center shrink-0 text-sage-300">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Cookie &amp; Privacy Preferences
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-sage-300 uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    DPA 2019
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">
                  We use cookies and local tokens to secure client portal sessions, remember your currency preferences, and anonymously analyze site performance in compliance with the Kenya Data Protection Act (DPA 2019).
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 order-3 sm:order-1 text-xs text-white/50">
                <Link
                  href="/legal/cookies"
                  className="hover:text-sage-300 underline underline-offset-4 transition-colors"
                >
                  Cookie Policy
                </Link>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(true)}
                  className="hover:text-sage-300 transition-colors inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Customize
                </button>
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors cursor-pointer text-center"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold bg-sage-300 text-ink hover:bg-sage-100 transition-colors cursor-pointer text-center"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Customization Preferences View */
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-sage-300" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Customize Cookie Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Back to overview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {/* Strictly Necessary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Strictly Necessary</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Lock className="w-2.5 h-2.5" />
                      Always Active
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">
                    Essential for secure authentication, CSRF tokens, and Client Portal functionality. Cannot be switched off.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <span className="w-10 h-5 bg-sage-500/50 rounded-full flex items-center justify-end px-1 opacity-75 cursor-not-allowed">
                    <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-sage-700" />
                    </span>
                  </span>
                </div>
              </div>

              {/* Functional & Preferences */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Functional &amp; Preferences</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">
                    Remembers choices such as your selected billing currency (KES, USD, CAD) and UI states so you don&apos;t have to re-enter them.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.functional}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        functional: !prev.functional,
                      }))
                    }
                    className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                      preferences.functional ? "bg-sage-300 justify-end" : "bg-white/20 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-ink shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Performance & Analytics */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Performance &amp; Analytics</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">
                    Helps us understand how visitors navigate the platform, error rates, and load performance using anonymized metrics.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.analytics}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                      preferences.analytics ? "bg-sage-300 justify-end" : "bg-white/20 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-ink shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Marketing & Communications */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Marketing &amp; Insights</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/60 leading-normal">
                    Enables engineering insight recommendations and customized event notifications. Zero third-party ad retargeting.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.marketing}
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                      preferences.marketing ? "bg-sage-300 justify-end" : "bg-white/20 justify-start"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-ink shadow-sm" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer text-center py-1.5"
              >
                &larr; Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors cursor-pointer text-center"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold bg-sage-300 text-ink hover:bg-sage-100 transition-colors cursor-pointer text-center"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
