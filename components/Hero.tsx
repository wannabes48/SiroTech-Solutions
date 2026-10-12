"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import Navbar from "./Navbar";
import KineticGrid from "./ui/kinetic-grid";

export default function Hero() {
  const scrollToTrust = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("trust");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-screen min-h-[100dvh] overflow-hidden">
      <KineticGrid
        globalColor="sage"
        className="hero-bg w-full min-h-screen min-h-[100dvh] flex flex-col justify-between overflow-hidden"
      >
        {/* Nav pill floating at top */}
        <Navbar isHeroOverlay={true} />

        {/* Main Hero Container */}
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 flex-1 flex flex-col justify-between pt-4 sm:pt-8 pb-8 sm:pb-12 relative z-10">
          {/* Upper section: Paragraph + CTAs positioned right of centre on desktop, stacked on mobile */}
          <div className="w-full flex justify-end lg:pr-6 xl:pr-12 pt-6 sm:pt-10 lg:pt-14">
            <div className="w-full max-w-md lg:max-w-lg">
              <p className="text-white/95 text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 font-medium">
                From custom web platforms to cloud infrastructure and AI integrations, our studio delivers reliable software that scales seamlessly with your business.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-ink bg-sage-300 hover:bg-white transition-all shadow-md text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-white/50 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Lower section: Headline bottom-left with avatar stack inline after "Solutions" + circular scroll cue */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 pt-10 sm:pt-14 pb-2">
            {/* Headline bottom-left — ONLY H1 on the page */}
            <div className="max-w-3xl lg:max-w-4xl">
              <h1 className="text-display text-white tracking-tight leading-[1.04]">
                Drive Growth with <br className="hidden sm:inline" />
                Scalable, Smart IT <br className="hidden sm:inline" />
                <span className="inline-flex items-center gap-3 sm:gap-4 mt-2 flex-wrap">
                  <span>Solutions</span>
                </span>
              </h1>
            </div>

            {/* Circular scroll cue smooth-scrolls to #trust */}
            <div className="shrink-0 self-end lg:self-end">
              <a
                href="#trust"
                onClick={scrollToTrust}
                aria-label="Scroll down to technologies section"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-white hover:border-white hover:bg-white/5 transition-all cursor-pointer group shadow-sm"
              >
                <ArrowDown className="w-6 h-6 stroke-[1.5] transition-transform duration-300 group-hover:translate-y-1.5" />
              </a>
            </div>
          </div>
        </div>
      </KineticGrid>
    </section>
  );
}
