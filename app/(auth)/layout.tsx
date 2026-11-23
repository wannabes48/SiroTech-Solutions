import { mainUrl } from "@/lib/hosts";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ExternalLink,
  LifeBuoy,
  Phone,
  Home,
  Briefcase,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bg text-ink">
      {/* Left Column: Brand & Security Overview (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#1B2E24] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sage-500/10 blur-3xl pointer-events-none" />

        {/* Top: Brand Logo & Navigation Back */}
        <div className="relative z-10">
          <Link href={mainUrl()} className="inline-block group" aria-label="SiroTech Solutions Home">
            <Logo variant="dark" className="h-9 w-auto transition-transform group-hover:scale-[1.02]" />
          </Link>
          <div className="mt-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Client Portal &amp; Engineering Workspace
            </span>
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white mt-4 leading-snug">
              Your projects, files and invoices in one place.
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Access your sprint telemetry, staging deployments, milestone invoices, and direct support lines with our technical leadership in Nairobi.
            </p>
          </div>
        </div>

        {/* Middle: Key Trust Highlights */}
        <div className="relative z-10 space-y-4 my-8">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Kenya DPA (2019) &amp; ISO 27001 Ready</div>
              <div className="text-[11px] text-white/60 mt-0.5">
                Client data, source code, and telemetry isolated under strict encryption.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">100% Client IP Ownership</div>
              <div className="text-[11px] text-white/60 mt-0.5">
                All repositories, architectures, and database migrations belong to your business.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Quick Links */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
          <Link
            href={mainUrl()}
            className="hover:text-white flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to public website</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href={mainUrl("/legal/privacy")} className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href={mainUrl("/legal/terms")} className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href={mainUrl("/contact")} className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Full Navigation Header + Form Container + Footer */}
      <div className="lg:col-span-7 flex flex-col min-h-screen bg-bg">
        {/* Dedicated Auth Top Navigation Bar */}
        <header className="w-full border-b border-rule/70 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href={mainUrl()} className="flex items-center gap-2 group" aria-label="SiroTech Solutions Home">
              <Logo variant="light" className="h-7 sm:h-8 w-auto transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* Quick public site links */}
            <nav className="hidden sm:flex items-center gap-1.5 pl-4 border-l border-rule/80 text-xs font-semibold text-muted">
              <Link
                href={mainUrl("/services")}
                className="px-2.5 py-1 rounded-lg hover:text-ink hover:bg-surface transition-colors"
              >
                Services
              </Link>
              <Link
                href={mainUrl("/pricing")}
                className="px-2.5 py-1 rounded-lg hover:text-ink hover:bg-surface transition-colors"
              >
                Pricing
              </Link>
              <Link
                href={mainUrl("/work")}
                className="px-2.5 py-1 rounded-lg hover:text-ink hover:bg-surface transition-colors"
              >
                Work
              </Link>
              <Link
                href={mainUrl("/contact")}
                className="px-2.5 py-1 rounded-lg hover:text-ink hover:bg-surface transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={mainUrl()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface hover:bg-rule/70 border border-rule text-xs font-semibold text-ink transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </Link>

            <Link
              href={mainUrl("/book")}
              className="hidden md:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Book Call</span>
            </Link>
          </div>
        </header>

        {/* Centered Auth Card Container */}
        <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Dedicated Auth Footer Navigation */}
        <footer className="w-full border-t border-rule/70 px-6 py-4 bg-white/50 text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Need technical help?{" "}
              <Link
                href={mainUrl("/contact")}
                className="font-semibold text-ink hover:text-emerald-700 underline underline-offset-2"
              >
                Contact engineering support
              </Link>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href={mainUrl()} className="hover:text-ink transition-colors">
              Home
            </Link>
            <Link href={mainUrl("/legal/privacy")} className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href={mainUrl("/legal/terms")} className="hover:text-ink transition-colors">
              Terms
            </Link>
            <Link href={mainUrl("/faq")} className="hover:text-ink transition-colors">
              FAQs
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
