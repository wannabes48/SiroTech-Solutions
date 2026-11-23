"use client";

import { portalPath } from "@/lib/hosts";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Bell,
  Phone,
  User,
  ShieldCheck,
  Building,
  FolderKanban,
  ReceiptText,
  LifeBuoy,
  MessageSquare,
  ExternalLink,
  Check,
  Globe,
  CreditCard,
  Smartphone,
  ChevronRight,
  Terminal,
  Zap
} from "lucide-react";
import { completePortalWelcomeAction } from "@/app/portal/actions";

interface PortalWelcomeClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    timezone: string;
    welcomeCompleted: boolean;
  };
  organization: {
    id: string;
    name: string;
  };
  initialPrefs: {
    emailMessages: boolean;
    emailUpdates: boolean;
    emailInvoices: boolean;
    emailTickets: boolean;
  };
}

export function PortalWelcomeClient({
  user,
  organization,
  initialPrefs,
}: PortalWelcomeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Wizard Step: 1 = Profile & Phone, 2 = Timezone, 3 = Notifications, 4 = 3-Step Tour, 5 = Done
  const [step, setStep] = useState(1);
  // Tour Sub-step (1, 2, or 3)
  const [tourStep, setTourStep] = useState(1);

  // Form State
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [timezone, setTimezone] = useState(user.timezone || "Africa/Nairobi");
  const [emailUpdates, setEmailUpdates] = useState(initialPrefs?.emailUpdates ?? true);
  const [emailInvoices, setEmailInvoices] = useState(initialPrefs?.emailInvoices ?? true);
  const [emailTickets, setEmailTickets] = useState(initialPrefs?.emailTickets ?? true);
  const [emailMessages, setEmailMessages] = useState(initialPrefs?.emailMessages ?? true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Skip setup handler: marks flag in database and routes to portal
  const handleSkip = () => {
    startTransition(async () => {
      const res = await completePortalWelcomeAction({ skipped: true });
      if (res.success) {
        router.push(portalPath());
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to skip setup.");
      }
    });
  };

  // Complete setup handler: saves confirmed data + marks flag in database
  const handleComplete = () => {
    startTransition(async () => {
      const res = await completePortalWelcomeAction({
        name,
        phone,
        timezone,
        notificationPreferences: {
          emailMessages,
          emailUpdates,
          emailInvoices,
          emailTickets,
        },
        skipped: false,
      });

      if (res.success) {
        router.push(portalPath());
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to save checklist settings.");
      }
    });
  };

  const checklistItems = [
    { num: 1, title: "Profile & Phone", completed: Boolean(name && phone) && step > 1 },
    { num: 2, title: "Timezone", completed: Boolean(timezone) && step > 2 },
    { num: 3, title: "Notifications", completed: step > 3 },
    { num: 4, title: "3-Step Tour", completed: step > 4 || (step === 4 && tourStep === 3) },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 animate-in fade-in duration-300 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rule/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>First-Login Workspace Checklist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Welcome to SiroTech Solutions
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Setting up your dedicated engineering portal for{" "}
            <strong className="text-ink font-semibold">{organization.name}</strong>.
          </p>
        </div>

        {/* Skippable Action */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isPending}
          className="self-start sm:self-center px-4 py-2 rounded-full border border-rule hover:bg-surface text-muted hover:text-ink text-xs font-semibold cursor-pointer transition-colors shrink-0"
        >
          Skip setup for now →
        </button>
      </div>

      {/* Progress Checklist Bar */}
      <div className="bg-white rounded-2xl border border-rule/80 p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {checklistItems.map((item) => {
            const isCurrent = step === item.num;
            return (
              <div
                key={item.num}
                onClick={() => {
                  if (item.num <= step) setStep(item.num);
                }}
                className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2.5 ${
                  isCurrent
                    ? "bg-[#1B2E24] text-white border-[#1B2E24] shadow-xs"
                    : item.completed
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200 cursor-pointer"
                    : "bg-surface border-rule/60 text-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? "bg-emerald-500 text-white"
                      : item.completed
                      ? "bg-emerald-600 text-white"
                      : "bg-rule text-muted"
                  }`}
                >
                  {item.completed ? <Check className="w-3 h-3 stroke-[3]" /> : item.num}
                </div>
                <div className="truncate font-semibold tracking-tight">
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Checklist Wizard Card */}
      <div className="bg-white rounded-3xl border border-rule/80 p-6 sm:p-9 shadow-sm relative overflow-hidden">
        {/* ========================================================================= */}
        {/* CHECKLIST 1: CONFIRM NAME & PHONE */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
                <span>Checklist Item 1 of 4</span>
              </div>
              <h2 className="text-xl font-bold text-ink">Confirm Your Profile &amp; Handset Number</h2>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Confirm your full name and direct handset. Our lead engineering team uses this for critical staging deployments, Sev-1 incident dispatches, and Paystack/M-Pesa STK receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kariuki Mwangi"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Direct Mobile Handset <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 712 345 678"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Supports Kenyan numbers (+254) and international formats.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink mb-1.5">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface/80 border border-rule text-xs text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-0.5">
                <span className="font-bold">Kenya Data Protection Act (DPA 2019) &amp; GDPR Compliant</span>
                <p className="text-emerald-800 text-[11px]">
                  Your direct handset is strictly confidential and reserved for authorized operational alerts and two-factor authentication.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-rule/60">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-muted hover:text-ink font-semibold"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    setErrorMessage("Please enter your full name.");
                    return;
                  }
                  setErrorMessage(null);
                  setStep(2);
                }}
                className="px-6 py-2.5 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <span>Save &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHECKLIST 2: SET TIMEZONE */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
                <span>Checklist Item 2 of 4</span>
              </div>
              <h2 className="text-xl font-bold text-ink">Set Your Operating Timezone</h2>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Our core software engineering hub operates out of Nairobi (East Africa Time). Selecting your timezone aligns sprint planning, milestone deadlines, and deployment schedules.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-ink">Primary Operating Timezone</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-rule text-xs sm:text-sm text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 font-medium"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3) • Kenya &amp; East Africa (Recommended)</option>
                  <option value="Europe/London">Europe/London (GMT/BST) • United Kingdom</option>
                  <option value="America/New_York">America/New_York (EST/EDT) • US East</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT) • US West</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4) • United Arab Emirates</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET/CEST) • Central Europe</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2) • South Africa</option>
                  <option value="UTC">UTC • Coordinated Universal Time</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-surface border border-rule/70 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-ink block">Standard Sprint Hours</span>
                  <p className="text-[11px] text-muted mt-0.5">
                    Monday to Friday, 8:00 AM – 6:00 PM EAT. Daily standup telemetry and commit builds run continuously.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-rule/70 flex items-start gap-3">
                <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-ink block">24/7 Production Monitoring</span>
                  <p className="text-[11px] text-muted mt-0.5">
                    Critical production clusters, database health checks, and Sev-1 hotfix pipelines operate 24/7/365.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-rule/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-muted hover:text-ink font-semibold"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHECKLIST 3: NOTIFICATION CHOICES */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-2">
                <span>Checklist Item 3 of 4</span>
              </div>
              <h2 className="text-xl font-bold text-ink">Configure Notification Channels</h2>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Choose which real-time alerts and dispatches are routed to <strong className="text-ink">{user.email}</strong>.
              </p>
            </div>

            <div className="divide-y divide-rule/70 text-xs">
              <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">Sprint Milestones &amp; Code Telemetry</span>
                    <span className="text-[11px] text-muted">
                      Weekly summaries of commit progress, staging deployment URLs, and milestone review requests.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-rule shrink-0"
                />
              </label>

              <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">Invoices &amp; Paystack Payment Receipts</span>
                    <span className="text-[11px] text-muted">
                      Official KRA VAT e-invoices, M-Pesa STK receipts, and payment confirmations.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailInvoices}
                  onChange={(e) => setEmailInvoices(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-rule shrink-0"
                />
              </label>

              <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 shrink-0 mt-0.5">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">Support Tickets &amp; SLA Responses</span>
                    <span className="text-[11px] text-muted">
                      Real-time engineer replies and resolution notices on your open support threads.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailTickets}
                  onChange={(e) => setEmailTickets(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-rule shrink-0"
                />
              </label>

              <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-ink block">Direct Project Messages &amp; Attachments</span>
                    <span className="text-[11px] text-muted">
                      Private correspondence and architectural design briefs from your assigned tech lead.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailMessages}
                  onChange={(e) => setEmailMessages(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-rule shrink-0"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-rule/60">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-muted hover:text-ink font-semibold"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Continue to 3-Step Tour</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CHECKLIST 4: TAKE THE 3-STEP TOUR */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span>Checklist Item 4 of 4 &bull; Tour Step {tourStep} of 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((t) => (
                    <div
                      key={t}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        tourStep === t ? "w-6 bg-emerald-600" : "bg-rule"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h2 className="text-xl font-bold text-ink">Portal Guided Walkthrough</h2>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Take a quick 3-step tour of the primary hubs powering your collaboration with SiroTech.
              </p>
            </div>

            {/* TOUR STEP 1: PROJECTS & SPRINTS */}
            {tourStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#1B2E24] to-[#122019] text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Feature 1 &bull; Projects &amp; Milestones
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      IN PROGRESS (85%)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Live Sprint Tracking &amp; Deliverables</h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Every project features clear sprint breakdowns, live staging preview URLs, code repository commit logs, and 1-click milestone approval sign-offs.
                    </p>
                  </div>

                  {/* Mock Visual Component */}
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-white/90">
                      <span>Sprint 3: M-Pesa STK Push Integration</span>
                      <span className="font-mono text-emerald-300">staging-preview-ready</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: "85%" }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/70 pt-1">
                      <span>Branch: main • Commit: a8f41e2</span>
                      <span className="underline cursor-pointer">Preview Staging Build ↗</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Real-time Velocity</span>
                    <span className="text-[11px] text-muted">Track commit progress as engineers push code.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Instant QA Staging</span>
                    <span className="text-[11px] text-muted">Test deliverables in sandbox before live release.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Sign-off Approvals</span>
                    <span className="text-[11px] text-muted">Authorize phase completion with a single click.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TOUR STEP 2: FINANCES & PAYSTACK */}
            {tourStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#1B2E24] to-[#122019] text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Feature 2 &bull; Paystack &amp; M-Pesa Finance
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      KES &amp; USD NATIVE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Frictionless Invoicing &amp; Instant Receipts</h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Settle milestone invoices seamlessly via Paystack with instantaneous M-Pesa STK prompts to your handset, Visa/Mastercard, or Bank Transfer, complete with KRA VAT ETR receipts.
                    </p>
                  </div>

                  {/* Mock Visual Component */}
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-emerald-300 font-bold">INV-2026-048</span>
                      <p className="text-[11px] text-white/80">Deliverable Phase 2: Core Engine Architecture</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-sm">KES 250,000</span>
                      <span className="block text-[10px] text-emerald-300 font-semibold">1-Click M-Pesa STK Push</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Paystack Unified</span>
                    <span className="text-[11px] text-muted">Handles M-Pesa STK and cards in one modal.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">KRA ETR Receipts</span>
                    <span className="text-[11px] text-muted">Automatic statutory tax invoices with PIN.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Audit Statements</span>
                    <span className="text-[11px] text-muted">Export complete financial history anytime.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TOUR STEP 3: 24/7 SUPPORT & MESSAGING */}
            {tourStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#1B2E24] to-[#122019] text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LifeBuoy className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Feature 3 &bull; Support SLAs &amp; Messaging
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      24/7 ON-CALL PAGER
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">Direct Lead Architect Support</h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Escalate production incidents with strict SLA response times (&lt;15m for Sev-1) or chat directly with your assigned lead engineers in private threads.
                    </p>
                  </div>

                  {/* Mock Visual Component */}
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-300">Ticket #TICK-402 &bull; Sev-1 Incident</span>
                      <span className="text-white/80">Response Time: 8 mins</span>
                    </div>
                    <p className="text-[11px] text-white/90 italic">
                      &quot;Lead Architect Daniel Siro responded: Identified worker lock in Redis staging cluster. Hotfix patch verified and live.&quot;
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Strict SLAs</span>
                    <span className="text-[11px] text-muted">Guaranteed response windows per severity.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Architect Access</span>
                    <span className="text-[11px] text-muted">Direct contact with engineers building your app.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-rule/70">
                    <span className="font-bold text-ink block mb-0.5">Secure Vault</span>
                    <span className="text-[11px] text-muted">Share credentials and specs with encryption.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-rule/60">
              <button
                type="button"
                onClick={() => {
                  if (tourStep > 1) {
                    setTourStep(tourStep - 1);
                  } else {
                    setStep(3);
                  }
                }}
                className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{tourStep === 1 ? "Back to Notifications" : "Previous Tour Step"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-muted hover:text-ink font-semibold"
                >
                  Skip for now
                </button>

                {tourStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep(tourStep + 1)}
                    className="px-6 py-2.5 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>Next Feature ({tourStep + 1} of 3)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>Complete Checklist</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: FINAL CONFIRMATION & ENTER WORKSPACE */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-2xl font-extrabold text-ink">You&apos;re All Set!</h2>
              <p className="text-xs sm:text-sm text-muted">
                Your first-login checklist is complete. Your workspace for{" "}
                <strong className="text-ink">{organization.name}</strong> is fully configured.
              </p>
            </div>

            {/* Completed Checklist Summary Card */}
            <div className="max-w-md mx-auto bg-surface rounded-2xl border border-rule/80 p-4 text-xs text-left space-y-2.5">
              <div className="flex items-center gap-2 text-ink">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                <span>
                  Profile: <strong>{name}</strong> • <strong>{phone}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                <span>
                  Timezone: <strong>{timezone}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                <span>
                  Notification Channels: <strong>Configured &amp; Active</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-ink">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                <span>
                  3-Step Tour: <strong>Completed</strong>
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleComplete}
                disabled={isPending}
                className="px-8 py-3 rounded-full bg-[#1B2E24] hover:bg-black text-white font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isPending ? "Configuring Workspace..." : "Open My Portal Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
