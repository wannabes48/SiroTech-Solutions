"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { CheckCircle2, Calendar, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

export default function ThankYouPage() {
  // Fires the conversion event (generate_lead) once via useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Standard Google Analytics / GTM event
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === "function") {
        gtag("event", "generate_lead", {
          event_category: "lead_generation",
          event_label: "contact_submission",
          value: 1,
        });
      }

      // Custom window event for analytics or tag managers
      window.dispatchEvent(
        new CustomEvent("sirotech:generate_lead", {
          detail: { event: "generate_lead", timestamp: new Date().toISOString() },
        })
      );
      console.log("[Conversion Event]: generate_lead fired successfully.");
    }
  }, []);

  return (
    <main className="min-h-screen bg-bg">
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 text-emerald-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Submission Confirmed
          </span>
          <h1 className="text-display text-white mb-4 max-w-2xl mx-auto leading-tight">
            Thank you for reaching out.
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Your project brief has landed securely with our engineering leads. We reply within 1 business day.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 -mt-10">
        {/* Three "What Happens Next" Steps Card */}
        <div className="bg-surface rounded-[28px] p-8 sm:p-12 border border-rule shadow-sm mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-8 text-center sm:text-left">
            What happens next?
          </h2>

          <div className="space-y-8">
            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-ink mb-1.5">
                  Architectural Review (Within 4 Business Hours)
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  Our engineering leads review your project brief, examine database/stack constraints, and draft initial technical recommendations.
                </p>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-ink mb-1.5">
                  Discovery Consultation Call
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  We reply via email and WhatsApp with available consultation windows to clarify user workflows, integrations, and compliance needs.
                </p>
              </div>
            </div>

            <div className="flex gap-5 sm:gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-sage-300 text-sage-800 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-ink mb-1.5">
                  Itemized Proposal &amp; Delivery Roadmap
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  You receive an itemized Statement of Work (SOW) outlining milestone deliveries, sprint cadences, and flat, transparent pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Action Boxes: Book a Call & Case Study */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action 1: Book immediately */}
          <div className="bg-bg rounded-[24px] p-7 border border-rule flex flex-col justify-between hover:border-sage-500/50 transition-colors shadow-2xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center mb-5">
                <Calendar className="w-5 h-5 text-sage-700" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Want to speak sooner?</h3>
              <p className="text-body text-xs sm:text-sm leading-relaxed mb-6">
                Skip the email exchange and lock in a 30-minute discovery call directly on our calendar.
              </p>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center justify-between w-full px-5 py-3.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors"
            >
              <span>Book Discovery Call</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Action 2: Case Study link */}
          <div className="bg-bg rounded-[24px] p-7 border border-rule flex flex-col justify-between hover:border-sage-500/50 transition-colors shadow-2xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center mb-5">
                <ExternalLink className="w-5 h-5 text-sage-700" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Explore Recent Work</h3>
              <p className="text-body text-xs sm:text-sm leading-relaxed mb-6">
                Discover how we engineered the Foresafe QR notification system with 99.9% uptime.
              </p>
            </div>
            <Link
              href="/work/foresafe"
              className="inline-flex items-center justify-between w-full px-5 py-3.5 rounded-full bg-surface text-ink border border-rule text-xs font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors"
            >
              <span>Read Foresafe Case Study</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
