"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  Briefcase,
  GitBranch,
} from "lucide-react";

const footerNavigation = {
  services: [
    { label: "Custom Software", href: "/services/custom-software" },
    { label: "Web Applications", href: "/services/web-application-development" },
    { label: "Mobile Apps", href: "/services/mobile-apps" },
    { label: "AI & Automation", href: "/services/ai-automation" },
    { label: "Cloud & DevOps", href: "/services/cloud-devops" },
    { label: "All 11 Services →", href: "/services" },
  ],
  solutions: [
    { label: "ERP & Operations", href: "/solutions/erp" },
    { label: "CRM & Portals", href: "/solutions/crm" },
    { label: "Fleet & Tracking", href: "/solutions/fleet" },
    { label: "FinTech & Payments", href: "/solutions/fintech" },
    { label: "AgriTech Systems", href: "/solutions/agritech" },
    { label: "All Solutions →", href: "/solutions" },
  ],
  industries: [
    { label: "Financial Services", href: "/industries/financial" },
    { label: "Healthcare & HIPAA", href: "/industries/healthcare" },
    { label: "Agriculture & Supply", href: "/industries/agriculture" },
    { label: "Retail & E-Commerce", href: "/industries/retail" },
    { label: "Education & EdTech", href: "/industries/education" },
    { label: "All Industries →", href: "/industries" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Process", href: "/process" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Careers", href: "/careers" },
    { label: "Technical Blog", href: "/blog" },
    { label: "Frequently Asked", href: "/faq" },
    { label: "Case Studies", href: "/work" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing to SiroTech Insights!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <footer className="bg-ink text-white/70 pt-20 sm:pt-24 pb-12 border-t border-white/10 overflow-hidden">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        {/* Top Section: Brand + Newsletter + Contact Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          {/* Brand & 2-Line Blurb */}
          <div className="lg:col-span-5 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-300 rounded-lg group"
              aria-label="SiroTech Solutions Home"
            >
              <Logo
                variant="dark"
                className="h-16 w-auto transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            {/* Two-line blurb */}
            <div className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              <p>An independent software &amp; IT engineering studio based in Nairobi.</p>
              <p className="mt-1 text-white/60">
                Specializing in scalable web applications, mobile platforms, and smart AI integrations.
              </p>
            </div>

            {/* Contact Details Block */}
            <div className="pt-2 space-y-3 text-xs sm:text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sage-300 shrink-0" />
                <a
                  href="mailto:hello@sirotech.com"
                  className="hover:text-white transition-colors"
                >
                  hello@sirotech.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sage-300 shrink-0" />
                <a
                  href="https://wa.me/254745131817"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +254 (0) 745 131 817 (Call &amp; WhatsApp)
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sage-300 shrink-0 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-7 lg:pl-10 flex flex-col justify-center">
            <div className="bg-white/5 rounded-[24px] p-6 sm:p-8 border border-white/10 max-w-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-sage-300 block mb-2">
                Engineering Insights
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Stay updated with modern tech insights
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mb-6 leading-relaxed">
                Join founders and engineering leaders across East Africa and beyond. Zero spam, unsubscribe anytime.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sage-300 transition-colors"
                    disabled={status === "loading"}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 px-6 py-3 rounded-full bg-sage-300 text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {status === "success" && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 mt-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 mt-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Middle Section: Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-16 border-b border-white/10">
          {/* Services Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-3">
              {footerNavigation.services.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Solutions
            </h4>
            <ul className="space-y-3">
              {footerNavigation.solutions.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Industries
            </h4>
            <ul className="space-y-3">
              {footerNavigation.industries.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Legal Links, Social Icons & Auto Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div>
            &copy; {new Date().getFullYear()} SiroTech Solutions. All rights reserved. Registered in Kenya.
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
                }
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
            <Link href="/legal/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
            <Link href="/legal/refunds" className="hover:text-white transition-colors">
              Refunds
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/254745131817"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15 hover:text-white transition-colors"
            >
              <Briefcase className="w-4 h-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15 hover:text-white transition-colors"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
