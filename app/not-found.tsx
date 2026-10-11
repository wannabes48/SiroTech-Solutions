"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Home, Code2, Briefcase, Boxes, DollarSign, Mail, ArrowRight } from "lucide-react";

const popularLinks = [
  { label: "Homepage", href: "/", icon: Home, desc: "Return to our main landing page" },
  { label: "Core Services", href: "/services", icon: Code2, desc: "Explore our 11 engineering offerings" },
  { label: "Productised Solutions", href: "/solutions", icon: Boxes, desc: "Pre-built ERP, POS, and CRM frameworks" },
  { label: "Case Studies", href: "/work", icon: Briefcase, desc: "Review real production deliverables" },
  { label: "Project Pricing", href: "/pricing", icon: DollarSign, desc: "Transparent KES & USD packages" },
  { label: "Contact & Inquiries", href: "/contact", icon: Mail, desc: "Start a conversation with our team" },
];

export default function NotFound() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-20 lg:py-28 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-sage-100 text-sage-700 border border-sage-300/60 mb-6">
            404 • Page Not Found
          </div>

          <h1 className="text-display text-ink mb-6 max-w-3xl mx-auto leading-tight">
            We couldn't locate that page.
          </h1>

          <p className="text-body text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            The link you clicked may be outdated, moved, or deleted. Try searching our site or choose one of our popular destinations below.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-lg mx-auto mb-16 relative flex items-center"
          >
            <Search className="w-5 h-5 text-muted absolute left-5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, case studies, solutions..."
              className="w-full bg-surface border border-rule rounded-full pl-13 pr-32 py-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-300/20 shadow-sm transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-sage-700 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Six Popular Links Grid */}
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted text-center mb-6">
              Popular Destinations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group bg-surface rounded-2xl p-5 border border-rule hover:border-rule/80 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-sage-700" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-ink group-hover:text-sage-700 transition-colors flex items-center justify-between">
                        <span>{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      </div>
                      <p className="text-xs text-muted mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
