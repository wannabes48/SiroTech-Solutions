"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Clock, PackageCheck, UserCheck } from "lucide-react";

export interface Stage {
  id: string;
  number: string;
  name: string;
  duration: string;
  summary: string;
  whatWeDo: string[];
  whatYouReceive: string[];
  whatWeNeedFromYou: string[];
}

export const processStages: Stage[] = [
  {
    id: "stage-plan",
    number: "01",
    name: "Plan & Architect",
    duration: "Weeks 1 – 2",
    summary: "We don't write code without an architectural blueprint. We eliminate structural risk upfront before sprint commitments.",
    whatWeDo: [
      "Deep-dive technical discovery & domain modeling workshops",
      "Entity Relationship Diagram (ERD) & database schema design",
      "API contract specification and integration dependency mapping",
      "Security threat modeling and data compliance evaluation (DPA/GDPR)",
      "Sprint roadmap breakdown with clear milestone deliverables",
    ],
    whatYouReceive: [
      "Technical Architecture Document (TAD)",
      "Database schema definitions & entity relationships",
      "Milestone-based Statement of Work (SOW) & delivery calendar",
    ],
    whatWeNeedFromYou: [
      "Product vision & existing user flow descriptions",
      "Access to existing APIs, accounts, or legacy documentation",
      "Key stakeholder availability for two 45-min scoping sessions",
    ],
  },
  {
    id: "stage-design",
    number: "02",
    name: "Design & Prototype",
    duration: "Weeks 2 – 3",
    summary: "Translating architectural requirements into intuitive, accessible, and user-tested visual flows in Figma.",
    whatWeDo: [
      "Information architecture, wireframes, and responsive layout grids",
      "Bespoke design token creation (typography, color palettes, spacing)",
      "Interactive high-fidelity clickable Figma prototype",
      "WCAG 2.1 AA accessibility contrast and touch target auditing",
      "Collaborative prototype review with your team",
    ],
    whatYouReceive: [
      "Complete clickable Figma prototype (mobile & desktop)",
      "Reusable design system component library",
      "Asset export bundle (icons, graphics, and layout guides)",
    ],
    whatWeNeedFromYou: [
      "Brand identity assets (logo, font licenses if proprietary)",
      "Feedback and approval on screen wireframes within 48 hours",
      "Sample real-world content, copy, or test catalog data",
    ],
  },
  {
    id: "stage-build",
    number: "03",
    name: "Build & Integrate",
    duration: "Weeks 3 – 6",
    summary: "Senior engineers execute the core application build in weekly staging sprints with continuous client visibility.",
    whatWeDo: [
      "Database migration setup, indexing, and connection pooling",
      "Full-stack Next.js / React Native application development",
      "Third-party API integration (M-Pesa STK, Stripe, Auth, Resend)",
      "Automated unit testing & CI/CD deployment pipelines",
      "Weekly live staging URL updates for your review",
    ],
    whatYouReceive: [
      "Live password-protected staging environment (updated weekly)",
      "Continuous GitHub repository commit access",
      "Weekly sprint demo Loom recordings & progress reports",
    ],
    whatWeNeedFromYou: [
      "Weekly 30-min sprint check-in or asynchronous demo review",
      "Provisioning of live third-party API credentials (M-Pesa, AWS)",
      "Timely sign-off on completed milestone deliverables",
    ],
  },
  {
    id: "stage-test-launch",
    number: "04",
    name: "Test, Harden & Launch",
    duration: "Weeks 6 – 8",
    summary: "Rigorous QA testing, vulnerability audits, performance tuning, and zero-downtime production cutover.",
    whatWeDo: [
      "Automated E2E browser testing (Playwright) across devices",
      "OWASP security vulnerability scanning & authorization tests",
      "Core Web Vitals & Lighthouse 95+ performance optimization",
      "DNS cutover, SSL provisioning, and Cloudflare WAF deployment",
      "Final production verification and client admin handover",
    ],
    whatYouReceive: [
      "100% production-ready deployed software on your domain",
      "Admin credentials, database documentation & handover guide",
      "30-day comprehensive post-launch bug warranty",
    ],
    whatWeNeedFromYou: [
      "Domain DNS access or DNS manager delegation",
      "Final User Acceptance Testing (UAT) signoff",
      "Operational team ready for 30-minute handover session",
    ],
  },
];

export function ProcessStages() {
  const [activeStage, setActiveStage] = useState<string>("stage-plan");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const stage of processStages) {
        const el = document.getElementById(stage.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveStage(stage.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStage = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* Sticky Left Progress Rail on Desktop */}
      <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
        <div className="bg-surface rounded-[24px] p-6 border border-rule space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted block mb-1">
            Engineering Rail
          </span>
          <p className="text-xs text-body">
            Click any phase to jump directly to detailed deliverables and requirements.
          </p>

          <div className="space-y-2 pt-3 border-t border-rule">
            {processStages.map((stage) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => scrollToStage(stage.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-sage-100 text-sage-800 font-bold shadow-xs border border-sage-300/40"
                      : "text-muted hover:bg-bg hover:text-ink font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono">{stage.number}</span>
                    <span className="text-xs">{stage.name}</span>
                  </div>
                  <span className="text-[10px] text-muted font-normal">
                    {stage.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Stages Cards (Right Column) */}
      <div className="lg:col-span-8 space-y-16">
        {processStages.map((stage) => (
          <article
            key={stage.id}
            id={stage.id}
            className="scroll-mt-28 bg-surface rounded-[32px] p-8 sm:p-12 border border-rule shadow-xs space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rule">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sage-700 block mb-1">
                  Stage {stage.number}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink">
                  {stage.name}
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-300 text-ink text-xs font-bold shrink-0 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{stage.duration}</span>
              </div>
            </div>

            <p className="text-body text-base leading-relaxed">
              {stage.summary}
            </p>

            {/* Three Blocks: What We Do, What You Receive, What We Need */}
            <div className="space-y-6">
              {/* 1. What We Do */}
              <div className="bg-bg rounded-2xl p-6 border border-rule">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sage-700" />
                  What We Do
                </h3>
                <ul className="space-y-2.5">
                  {stage.whatWeDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-body">
                      <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. What You Receive */}
              <div className="bg-bg rounded-2xl p-6 border border-rule">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sage-700" />
                  What You Receive
                </h3>
                <ul className="space-y-2.5">
                  {stage.whatYouReceive.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. What We Need From You */}
              <div className="bg-bg rounded-2xl p-6 border border-rule">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sage-700" />
                  What We Need From You
                </h3>
                <ul className="space-y-2.5">
                  {stage.whatWeNeedFromYou.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
