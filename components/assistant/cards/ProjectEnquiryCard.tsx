"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { SERVICE_TITLES, BUDGETS, TIMELINES } from "@/content/enquiry-options";
import { Msg, transcriptFrom } from "../useAssistant";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

export interface ProjectEnquiryCardProps {
  prefill?: {
    need?: string;
    budget?: string;
    timeline?: string;
    summary?: string;
  };
  msgs?: Msg[];
  onSuccess?: () => void;
}

export function ProjectEnquiryCard({ prefill, msgs = [], onSuccess }: ProjectEnquiryCardProps) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Form State
  const [need, setNeed] = useState(
    prefill?.need && SERVICE_TITLES.includes(prefill.need as any)
      ? prefill.need
      : SERVICE_TITLES[0]
  );
  const [summary, setSummary] = useState(prefill?.summary || "");
  const [budget, setBudget] = useState(
    prefill?.budget && BUDGETS.includes(prefill.budget as any)
      ? prefill.budget
      : BUDGETS[1]
  );
  const [timeline, setTimeline] = useState(
    prefill?.timeline && TIMELINES.includes(prefill.timeline as any)
      ? prefill.timeline
      : TIMELINES[1]
  );
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [attachChat, setAttachChat] = useState(false);
  const [website, setWebsite] = useState(""); // Honeypot

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation per step
  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 0) {
      if (!need) {
        setError("Please choose what you need.");
        return false;
      }
      if (summary.trim().length < 10) {
        setError("Please enter a short description (at least 10 characters).");
        return false;
      }
      if (summary.trim().length > 800) {
        setError("Summary cannot exceed 800 characters.");
        return false;
      }
      return true;
    }
    if (s === 1) {
      if (!budget) {
        setError("Please select a budget range.");
        return false;
      }
      if (!timeline) {
        setError("Please select a target timeline.");
        return false;
      }
      if (url.trim()) {
        try {
          new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
        } catch {
          setError("Please enter a valid website URL or leave blank.");
          return false;
        }
      }
      return true;
    }
    if (s === 2) {
      if (name.trim().length < 2) {
        setError("Please enter your name (at least 2 characters).");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid work email address.");
        return false;
      }
      if (!consent) {
        setError("Please consent to being contacted.");
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep((cur) => (cur < 2 ? ((cur + 1) as 0 | 1 | 2) : cur));
    }
  };

  const back = () => {
    setError(null);
    setStep((cur) => (cur > 0 ? ((cur - 1) as 0 | 1 | 2) : cur));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      need,
      summary: summary.trim(),
      message: summary.trim(),
      budget,
      timeline,
      url: url.trim()
        ? url.trim().startsWith("http")
          ? url.trim()
          : `https://${url.trim()}`
        : undefined,
      name: name.trim(),
      company: company.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      consent: true,
      source: "assistant",
      transcript: attachChat ? transcriptFrom(msgs) : undefined,
      website: website || undefined,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Couldn't send. Please try again or email us.");
      }

      setDone(true);
      trackAssistantEvent({ name: "assistant_form_submitted", kind: "project" });
      router.prefetch("/thank-you");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Couldn't send. Please try again or email us.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="my-2 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 p-3.5 text-emerald-900 text-xs animate-in fade-in duration-200">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <h4 className="font-bold text-ink">Project Enquiry Received</h4>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Thanks <span className="font-semibold text-ink">{name}</span>! Our lead architect will review your{" "}
          <span className="font-semibold text-ink">{need}</span> brief and reply to{" "}
          <span className="font-semibold text-ink">{email}</span> within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <div className="my-2 rounded-2xl bg-white border border-rule/80 p-3.5 shadow-2xs text-xs">
      {/* 3-Dot Progress Indicator */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-rule/60">
        <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Project Enquiry</span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all duration-200 ${
                s === step
                  ? "w-5 bg-emerald-600"
                  : s < step
                  ? "w-2 bg-[#1B2E24]"
                  : "w-2 bg-rule"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); next(); }} className="space-y-2.5">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* STEP 1: Project */}
        {step === 0 && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-muted font-medium mb-1 text-[11px]">
                What do you need built?
              </label>
              <select
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs cursor-pointer"
              >
                {SERVICE_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1 text-[11px]">
                Brief Description ({summary.length}/800)
              </label>
              <textarea
                required
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key goals, features, or problems to solve..."
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Scope */}
        {step === 1 && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-muted font-medium mb-1 text-[11px]">
                Estimated Budget Range
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs cursor-pointer"
              >
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1 text-[11px]">
                Target Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs cursor-pointer"
              >
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1 text-[11px]">
                Existing Website or System URL (optional)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 3: You */}
        {step === 2 && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted font-medium mb-1 text-[11px]">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dorah Siro"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
                />
              </div>
              <div>
                <label className="block text-muted font-medium mb-1 text-[11px]">Company (opt)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Ltd"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-muted font-medium mb-1 text-[11px]">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@work.com"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
                />
              </div>
              <div>
                <label className="block text-muted font-medium mb-1 text-[11px]">Phone/WhatsApp (opt)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7..."
                  className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-[11px] text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded border-rule text-emerald-600 focus:ring-emerald-600/30"
              />
              <span>I consent to SiroTech contacting me about this project.</span>
            </label>

            <label className="flex items-center gap-2 text-[11px] text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={attachChat}
                onChange={(e) => setAttachChat(e.target.checked)}
                className="rounded border-rule text-emerald-600 focus:ring-emerald-600/30"
              />
              <span>Attach this chat to my enquiry for extra context.</span>
            </label>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-red-600 text-[11px] pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-rule/60">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={submitting}
              className="py-1.5 px-3 rounded-xl border border-rule hover:bg-surface text-ink text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[10px] text-muted font-medium">Step 1 of 3</span>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={next}
              className="py-1.5 px-3.5 rounded-xl bg-[#1B2E24] hover:bg-black text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Scope</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProjectEnquiryCard;
