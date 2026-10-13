export interface TimelineMilestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  achievements: string[];
}

export const studioTimeline: TimelineMilestone[] = [
  {
    year: "2022",
    title: "Laying the Foundation in Nairobi",
    subtitle: "Translating physical architecture into digital systems",
    description: "SiroTech was born out of a desire to apply traditional architectural rigor—structure, flow, and resilience—to software. Instead of following bloated agency models, we started as a lean, focused practice dedicated to building bespoke digital foundations from the ground up.",
    achievements: [
      "Shipped our first 5 end-to-end production client portals",
      "Established our core technical blueprint: TypeScript & PostgreSQL",
    ],
  },
  {
    year: "2024",
    title: "Tackling Local FinTech Realities",
    subtitle: "M-Pesa integrations and offline-first survival",
    description: "Building for East Africa means designing for real-world constraints. We dove deep into automated Safaricom Daraja M-Pesa payments and built offline-first sync protocols, learning exactly what it takes to handle high-concurrency financial transactions across spotty networks.",
    achievements: [
      "Scaled client apps to reliably process 500,000+ monthly transactions",
      "Maintained 99.98% uptime across demanding, real-world environments",
    ],
  },
  {
    year: "2025",
    title: "Going Global & Shipping Faster",
    subtitle: "Bridging time zones with modern developer stacks",
    description: "Our focus shifted to helping fast-moving startups—from East Africa to North America—execute on tight timelines. We leaned heavily into Next.js, Supabase, and Tailwind, proving that lean, senior-led teams in Nairobi can deliver world-class engineering and adapt to any time zone.",
    achievements: [
      "Launched 12 enterprise-grade web and mobile applications",
      "Standardized our delivery pipeline on the Next.js App Router and Supabase architecture",
    ],
  },
  {
    year: "2026",
    title: "Embracing the AI Era",
    subtitle: "Practical LLM pipelines and automated client operations",
    description: "With a rock-solid technical foundation in place, we began integrating practical AI—like Gemini API workflows and intelligent automation—into everyday operations. We shifted from just building apps to building intelligent frameworks that cut our clients' time-to-market in half.",
    achievements: [
      "Crossed the milestone of 24 active production systems deployed",
      "Launched the automated SiroTech Client Portal to streamline our own back-office operations",
    ],
  },

];
