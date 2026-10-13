"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { trackAssistantEvent } from "@/lib/assistant/analytics";

export interface ContactCardProps {
  hint?: string;
  onSuccess?: (info: { name: string; email: string }) => void;
}

export function ContactCard({ hint = "", onSuccess }: ContactCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(hint);
  const [consent, setConsent] = useState(true);
  const [website, setWebsite] = useState(""); // Honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out name, email, and message.");
      return;
    }
    if (!consent) {
      setError("Please consent to being contacted.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          need: "General question",
          source: "assistant",
          consent: true,
          website: website || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Could not send inquiry.");
      }

      setDone(true);
      trackAssistantEvent({ name: "assistant_form_submitted", kind: "contact" });
      onSuccess?.({ name: name.trim(), email: email.trim() });
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="my-2 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 p-3 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-medium">Sent. We&apos;ll reply within 1 business day.</span>
      </div>
    );
  }

  return (
    <div className="my-2 rounded-2xl bg-white border border-rule/80 p-3.5 shadow-2xs text-xs">
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-rule/60">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <h4 className="font-bold text-ink">Contact SiroTech</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
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

        <div>
          <label className="block text-muted font-medium mb-1 text-[11px]">Your Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dorah Siro"
            className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
          />
        </div>

        <div>
          <label className="block text-muted font-medium mb-1 text-[11px]">Work Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs"
          />
        </div>

        <div>
          <label className="block text-muted font-medium mb-1 text-[11px]">Message</label>
          <textarea
            required
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            className="w-full px-2.5 py-1.5 rounded-xl bg-surface border border-rule/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-ink text-xs resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-[11px] text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="rounded border-rule text-emerald-600 focus:ring-emerald-600/30"
          />
          <span>I consent to SiroTech contacting me regarding this enquiry.</span>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-red-600 text-[11px] pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-1 py-2 px-3 rounded-xl bg-[#1B2E24] hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ContactCard;
