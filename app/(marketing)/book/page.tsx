"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function BookPage() {
  const [selectedEventType, setSelectedEventType] = useState<"discovery" | "scoping">("discovery");
  const [calLoaded, setCalLoaded] = useState(false);

  // Lazy-load Cal.com embed script below the fold
  useEffect(() => {
    // Check if cal embed script is already loaded
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      script.onload = () => {
        setCalLoaded(true);
      };
      script.onerror = () => {
        console.warn("Cal.com embed script blocked or failed to load. Displaying fallback booking button.");
        setCalLoaded(false);
      };
      document.body.appendChild(script);

      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {}
      };
    }
  }, []);

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
            Select a convenient time on our calendar. Every consultation connects you directly with a senior engineer to evaluate feasibility, architecture, and milestones.
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
              src={`https://app.cal.com/sirotech/${
                selectedEventType === "discovery" ? "30min" : "60min"
              }?embed=true`}
              title="Cal.com Booking Embed"
              className="w-full h-[620px] border-0"
              allow="camera; microphone; autoplay; display-capture"
            />

            {/* Fallback Notice if Script Fails */}
            <div className="mt-4 p-4 rounded-xl bg-surface border border-rule text-xs text-muted text-center w-full max-w-xl">
              Can't see the calendar? It might be blocked by browser privacy extensions.{" "}
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
