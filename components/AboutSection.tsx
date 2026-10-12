import Link from "next/link";
import { MapPin, Globe } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="max-w-[1248px] mx-auto py-24 px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
    >
      {/* ── Left Column: Content (5 cols) ── */}
      <div className="lg:col-span-5 flex flex-col sm:flex-row gap-6">
        <span className="text-muted text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap sm:mt-2.5">
          About Us
        </span>
        <div className="space-y-6">
          <h2 className="text-h2 text-ink leading-tight">
            Driven by Innovation. <br />
            Powered by People.
          </h2>
          <p className="text-body text-base leading-relaxed">
            With years of hands-on experience in full-stack web engineering, cloud infrastructure, and AI integrations, we build high-trust digital solutions designed to survive real user loads.
          </p>
          <p className="text-body text-sm leading-relaxed">
            Rooted in architectural discipline, our engineering process prioritizes maintainability, security, and measurable commercial outcomes over unnecessary complexity.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-3.5 rounded-full bg-sage-300 text-ink text-sm font-semibold hover:bg-sage-100 transition-colors shadow-xs"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right Column: Visuals with Floating Chips & Trust Card (7 cols) ── */}
      <div className="lg:col-span-7 relative w-full h-[540px] flex items-center justify-center lg:justify-end pr-2 sm:pr-6">
        {/* Sage rounded portrait panel */}
        <div className="w-full sm:w-4/5 h-[92%] bg-sage-100 rounded-[32px] relative overflow-hidden shadow-lg border border-sage-300/40">
          <img
            src="https://files.ginistorage.com/Blogs/Files/Blog_101_1712498207705_Image.Creating_an_Organization_Wide_Innovation_Strategy_7827.png%7D"
            alt="Lead Engineer at SiroTech"
            className="w-full h-full object-cover object-top filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Floating Chip 1 — Growth */}
        <div className="absolute top-10 left-4 sm:left-12 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rule flex items-center gap-2 transform -rotate-2 select-none">
          <span className="text-sage-700 font-bold text-base leading-none">↗</span>
          <span className="text-ink text-xs sm:text-sm font-semibold">Growth</span>
        </div>

        {/* Floating Chip 2 — Cybersecurity */}
        <div className="absolute top-28 right-0 sm:right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rule transform rotate-3 select-none">
          <span className="text-ink text-xs sm:text-sm font-semibold">Cybersecurity</span>
        </div>

        {/* Floating Chip 3 — Infrastructure */}
        <div className="absolute bottom-20 right-2 sm:right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rule transform -rotate-1 z-10 select-none">
          <span className="text-ink text-xs sm:text-sm font-semibold">Infrastructure Management</span>
        </div>

        {/* Floating Chip 4 — Operational Excellence */}
        <div className="absolute top-4 right-16 sm:right-28 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rule transform rotate-2 select-none hidden sm:flex">
          <span className="text-ink text-xs sm:text-sm font-semibold">Operational Excellence</span>
        </div>

        {/* Verified Location & Serving Regions Card */}
        <div className="absolute bottom-8 left-2 sm:left-8 bg-white/95 backdrop-blur-md p-5 rounded-[24px] shadow-2xl border border-rule flex flex-col gap-2.5 max-w-[260px] z-20">
          <div className="flex items-center gap-2 text-sage-700 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Nairobi Studio</span>
          </div>
          <p className="text-xs font-semibold text-ink leading-snug">
            Based in Nairobi · Serving Kenya, East Africa and the rest of the world
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted pt-1 border-t border-rule">
            <Globe className="w-3 h-3 text-sage-500" />
            <span>Remote-First &amp; On-Site Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
