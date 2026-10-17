"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Video,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code2,
  CheckCircle2,
  Loader2,
  UserCheck,
} from "lucide-react";
import { recordConsultationBookingAction } from "@/app/actions/consultation-actions";

function BookPageContent() {
  const searchParams = useSearchParams();
  const [selectedEventType, setSelectedEventType] = useState<"discovery" | "scoping">("discovery");
  const [calLoaded, setCalLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    name: string;
    email: string;
    scheduledAt: string;
    calBookingId?: string;
  } | null>(null);

  // Helper to record consultation booking to backend and database
  const handleBookingRecorded = async (data: any) => {
    try {
      setIsSyncing(true);
      const booking = data?.booking || data?.payload || data || {};
      const attendee = booking?.attendees?.[0] || booking?.attendee || {};
      const responses = data?.responses || booking?.responses || {};

      const name =
        attendee?.name ||
        booking?.name ||
        responses?.name?.value ||
        responses?.name ||
        "Prospective Client";

      const email =
        attendee?.email ||
        booking?.email ||
        responses?.email?.value ||
        responses?.email ||
        "";

      const phone =
        attendee?.phone ||
        attendee?.phoneNumber ||
        responses?.phone?.value ||
        responses?.phone ||
        null;

      const company =
        responses?.company?.value ||
        responses?.company ||
        null;

      const startTime =
        booking?.startTime ||
        booking?.startsAt ||
        data?.startTime ||
        new Date().toISOString();

      const notes =
        responses?.notes?.value ||
        responses?.notes ||
        booking?.description ||
        booking?.title ||
        (selectedEventType === "scoping"
          ? "60-Min Technical Scoping"
          : "30-Min Discovery Consultation");

      const calBookingId = String(
        booking?.uid ||
        booking?.id ||
        data?.uid ||
        data?.bookingId ||
        `cal_${Date.now()}`
      );

      if (!email) {
        console.warn("[Cal.com Embed] No email found in booking payload", data);
        return;
      }

      const res = await recordConsultationBookingAction({
        name,
        email,
        phone,
        company,
        scheduledAt: startTime,
        notes,
        calBookingId,
        eventType: selectedEventType,
      });

      if (res?.success) {
        setConfirmedBooking({
          name,
          email,
          scheduledAt: res.scheduledAt || startTime,
          calBookingId,
        });
      }
    } catch (err) {
      console.error("[Cal.com Embed Sync Error]", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Check URL params for direct return confirmation
  useEffect(() => {
    const isBookedParam = searchParams.get("booked") === "true";
    const calIdParam = searchParams.get("cal_booking_id") || searchParams.get("bookingId");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name") || "Client";
    const dateParam = searchParams.get("date") || searchParams.get("startTime");

    if ((isBookedParam || calIdParam) && emailParam) {
      handleBookingRecorded({
        booking: {
          id: calIdParam,
          uid: calIdParam,
          startTime: dateParam || new Date().toISOString(),
          attendees: [{ name: nameParam, email: emailParam }],
        },
      });
    }
  }, [searchParams]);

  // Lazy-load Cal.com embed script and attach listeners
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Official Cal.com embed script loader snippet
      (function (C: any, A: string, L: string) {
        const p = function (a: any, ar: any) { a.q.push(ar); };
        const d = C.document;
        C.Cal = C.Cal || function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      const Cal = (window as any).Cal;
      if (Cal) {
        Cal("init", { origin: "https://app.cal.com" });
        Cal("on", {
          action: "bookingSuccessful",
          callback: (e: any) => {
            console.log("[Cal.com SDK bookingSuccessful]", e);
            const data = e?.detail?.data || e?.data || e;
            handleBookingRecorded(data);
          },
        });
        setCalLoaded(true);
      }

      // 2. PostMessage listener fallback for embedded iframe
      const handleWindowMessage = (e: MessageEvent) => {
        try {
          let msgData = e.data;
          if (typeof msgData === "string" && (msgData.includes("cal:") || msgData.includes("bookingSuccessful"))) {
            try {
              msgData = JSON.parse(msgData);
            } catch {}
          }

          if (
            msgData?.type === "cal:bookingSuccessful" ||
            msgData?.action === "bookingSuccessful" ||
            msgData?.event === "bookingSuccessful"
          ) {
            console.log("[Cal.com postMessage bookingSuccessful]", msgData);
            handleBookingRecorded(msgData.data || msgData.payload || msgData);
          }
        } catch (err) {
          console.warn("[handleWindowMessage error]", err);
        }
      };

      window.addEventListener("message", handleWindowMessage);
      return () => {
        window.removeEventListener("message", handleWindowMessage);
      };
    }
  }, [selectedEventType]);

  const calLink =
    selectedEventType === "discovery"
      ? "https://cal.com/sirotech/30min"
      : "https://cal.com/sirotech/60min";

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Direct Calendar Booking
          </span>
          <h1 className="text-display text-white mb-6 max-w-3xl mx-auto leading-tight">
            Book an Engineering Consultation
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Select a convenient time on our calendar. Every consultation connects you directly with Daniel Siro and senior engineering architects to evaluate technical feasibility, system architecture, and delivery milestones.
          </p>

          {/* Event Type Selector Pills */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full p-1.5 border border-white/20">
            <button
              type="button"
              onClick={() => setSelectedEventType("discovery")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedEventType === "discovery"
                  ? "bg-white text-ink shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              30-Min Discovery Call
            </button>
            <button
              type="button"
              onClick={() => setSelectedEventType("scoping")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedEventType === "scoping"
                  ? "bg-white text-ink shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              60-Min Technical Scoping
            </button>
          </div>
        </div>
      </div>

      {/* Main Booking Container */}
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 py-20 -mt-10">
        {/* Confirmed Booking Banner */}
        {confirmedBooking && (
          <div className="p-6 sm:p-8 rounded-[28px] bg-emerald-50 border border-emerald-300 shadow-sm mb-12 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                      Consultation Confirmed &amp; Logged
                    </span>
                    <span className="text-xs font-mono text-emerald-800 font-semibold">
                      ID: {confirmedBooking.calBookingId}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-ink">
                    Thank you, {confirmedBooking.name}! We look forward to our session.
                  </h3>
                  <p className="text-xs text-body leading-relaxed max-w-2xl">
                    Your consultation is booked for{" "}
                    <strong className="text-ink">
                      {new Date(confirmedBooking.scheduledAt).toLocaleString("en-KE", {
                        dateStyle: "full",
                        timeStyle: "short",
                        timeZone: "Africa/Nairobi",
                      })}{" "}
                      EAT
                    </strong>
                    . An email with calendar invitations and private Google Meet link has been sent to{" "}
                    <strong className="text-ink">{confirmedBooking.email}</strong>. Our leadership team has been notified.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="px-4 py-2 rounded-full bg-white border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        )}

        {/* 3 Reasons to Book Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 p-8 rounded-[28px] bg-surface border border-rule shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
              <Code2 className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink mb-1">
                Direct Senior Engineer Access
              </h3>
              <p className="text-xs text-body leading-relaxed">
                You will speak with actual architects who write code and ship systems, not non-technical sales agents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink mb-1">
                Actionable Feasibility Feedback
              </h3>
              <p className="text-xs text-body leading-relaxed">
                Receive immediate clarity on database models, cloud hosting trade-offs, and compliance constraints.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink mb-1">
                Zero Obligation &amp; Strict NDA
              </h3>
              <p className="text-xs text-body leading-relaxed">
                All discussions remain strictly confidential. Walk away with clear scope whether we partner or not.
              </p>
            </div>
          </div>
        </div>

        {/* Cal.com Embed & Fallback Container */}
        <div className="bg-surface rounded-[28px] p-6 sm:p-10 border border-rule shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-rule mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-700 mb-1">
                <Clock className="w-4 h-4" />
                <span>
                  {selectedEventType === "discovery" ? "30 Minutes Duration" : "60 Minutes Duration"}
                </span>
                {isSyncing && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse font-normal">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Synchronizing with SiroTech CRM...
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                {selectedEventType === "discovery"
                  ? "Introductory Discovery & Scope Evaluation"
                  : "Deep-Dive Technical Scoping & Architecture"}
              </h2>
            </div>

            {/* Direct External Link Fallback */}
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-bg border border-rule text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-white transition-colors shrink-0"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Cal.com Interactive Embed Area */}
          <div className="w-full min-h-[580px] rounded-2xl overflow-hidden bg-white border border-rule flex flex-col items-center justify-center relative p-4">
            <iframe
              key={selectedEventType}
              src={`https://app.cal.com/sirotech/${
                selectedEventType === "discovery" ? "30min" : "60min"
              }?embed=true`}
              title="Cal.com Booking Embed"
              className="w-full h-[620px] border-0"
              allow="camera; microphone; autoplay; display-capture; clipboard-read; clipboard-write"
            />

            {/* Fallback Notice if Script Fails */}
            <div className="mt-4 p-4 rounded-xl bg-surface border border-rule text-xs text-muted text-center w-full max-w-xl">
              Can&apos;t see the calendar? It might be blocked by browser privacy extensions.{" "}
              <a
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink font-bold underline hover:text-sage-700"
              >
                Click here to book directly on Cal.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-xs text-muted">Loading booking calendar...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
