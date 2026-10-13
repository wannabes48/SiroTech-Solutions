"use client";

import { Star } from "lucide-react";
import { Carousel } from "@/components/ui/Carousel";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    name: "Keri Handla",
    role: "CTO",
    company: "Certchain Group",
    quote: "SiroTech engineered our payment routing platform flawlessly. The architectural rigor they brought allowed us to scale beyond 100,000 daily transactions without latency degradation.",
    rating: 5,
  },
  {
    name: "David Ochieng",
    role: "Co-Founder",
    company: "SmartStack Africa",
    quote: "Working with their team was an absolute breath of fresh air. They didn't just write clean TypeScript; they helped design our offline-first data sync engine for rural farmers.",
    rating: 5,
  },
  {
    name: "Morris Mwangi",
    role: "Director of Technology",
    company: "Mizani KE",
    quote: "Security and HIPAA compliance were our biggest blockers. SiroTech architected a rock-solid patient portal that passed all compliance audits on the very first submission.",
    rating: 5,
  },
];

export default function Testimonials() {
  // Requirement: hide section if fewer than 3 testimonials
  if (!testimonials || testimonials.length < 3) {
    return null;
  }

  return (
    <section className="py-24 bg-bg overflow-hidden border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <SectionHeader
          align="center"
          label="Testimonials"
          heading="Built for Founders Who Demand Engineering Rigor"
          description="Read direct feedback from CTOs, product managers, and founders who trust SiroTech with mission-critical systems."
        />

        <Carousel itemWidth={400}>
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="w-[85vw] sm:w-[380px] bg-surface rounded-[24px] p-8 border border-rule flex flex-col justify-between h-[340px]"
            >
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-sage-700 text-sage-700"
                    />
                  ))}
                </div>
                <p className="text-body text-sm sm:text-base leading-relaxed line-clamp-5">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-rule/60">
                <div className="w-10 h-10 rounded-full bg-sage-300 flex items-center justify-center text-sage-800 font-bold text-sm shrink-0">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-ink text-sm leading-snug">{test.name}</h4>
                  <p className="text-muted text-xs">
                    {test.role}, {test.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
