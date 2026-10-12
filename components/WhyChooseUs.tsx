"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/Accordion";
import { ArrowRight } from "lucide-react";

const items = [
  {
    id: "tailored",
    title: "Tailored Solutions",
    body: "We don't believe in one-size-fits-all templates. Every solution we engineer is built specifically around your workflows, business constraints, and growth milestones.",
  },
  {
    id: "scalable",
    title: "Scalable and Future-Ready",
    body: "Technologies chosen for your project are actively maintained, industry-standard, and architected to scale effortlessly as your concurrent user base expands.",
  },
  {
    id: "client-centric",
    title: "Client-Centric Approach",
    body: "Direct communication with engineers, transparent weekly sprints, staging previews, and no hidden black boxes. You retain full visibility at every stage.",
  },
  {
    id: "security",
    title: "Security and Compliance First",
    body: "Every line of code is written with security best practices, strict encryption, OWASP guidelines, and data compliance standards (Kenya DPA, GDPR).",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why" className="py-24 bg-surface border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left — Rounded team photo + About Us pill */}
          <div className="flex-1 w-full">
            <div className="w-full aspect-[4/3] rounded-[32px] overflow-hidden relative shadow-lg border border-rule">
              <img
                src="https://img.magnific.com/free-vector/coworkers-cartoon-characters-effective-collaboration-coworkers-cooperation-teamwork-colleagues-discussing-solution-successful-interaction_335657-2309.jpg?semt=ais_hybrid&w=740&q=80"
                alt="SiroTech Engineering Team Collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="mt-8 flex items-center justify-start">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-ink bg-sage-300 hover:bg-sage-100 transition-colors shadow-xs"
              >
                <span>About Our Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right — Header + Radix Accordion */}
          <div className="flex-1 max-w-lg w-full">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
              <span className="text-muted text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap sm:mt-2.5">
                Why Choose Us
              </span>
              <h2 className="text-h2 text-ink leading-tight">
                Built on Trust, <br />
                Driven by Results
              </h2>
            </div>

            <Accordion
              type="single"
              collapsible
              defaultValue="tailored"
              className="border-t border-rule"
            >
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>{item.body}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
