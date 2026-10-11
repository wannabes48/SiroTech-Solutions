import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CtaBand } from "@/components/ui/CtaBand";
import { technologiesData } from "@/data/technologies";
import { Code2, Server, Smartphone, BrainCircuit, Cloud, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Technologies We Build With — Full Stack & Cloud | SiroTech Solutions",
  description:
    "Explore SiroTech's modern technology stack: Next.js, TypeScript, PostgreSQL, React Native, Gemini AI, Docker, AWS, and Playwright.",
};

const categoryIcons: Record<string, React.ElementType> = {
  frontend: Code2,
  backend: Server,
  mobile: Smartphone,
  "data-ai": BrainCircuit,
  "cloud-devops": Cloud,
  testing: ShieldCheck,
};

export default function TechnologiesPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Technologies" },
            ]}
            className="text-sage-100 justify-center mb-6 [&_span]:text-white [&_a]:text-sage-100"
          />
          <span className="text-sage-100 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Proven, Production-Ready Stack
          </span>
          <h1 className="text-display text-white mb-6 max-w-4xl mx-auto leading-tight">
            Technologies We Build With
          </h1>
          <p className="text-sage-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            We don't chase transient hype. We choose battle-tested, actively maintained tools with strong type safety, massive ecosystems, and proven scalability under load.
          </p>

          {/* Quick Anchor Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {technologiesData.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors"
              >
                {cat.title.split(" & ")[0]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stacked Categories */}
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 space-y-20 py-20">
        {technologiesData.map((category) => {
          const Icon = categoryIcons[category.id] || Code2;
          return (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-28 bg-surface rounded-[32px] p-8 sm:p-12 border border-rule shadow-xs space-y-8"
            >
              {/* Category Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-rule">
                <div className="w-12 h-12 rounded-2xl bg-sage-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-sage-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink mb-1">{category.title}</h2>
                  <p className="text-body text-xs sm:text-sm leading-relaxed max-w-3xl">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Tool Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {category.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-5 rounded-2xl bg-bg border border-rule/70 hover:border-sage-500/50 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-sage-700 shrink-0" />
                        <h3 className="text-base font-bold text-ink">{tool.name}</h3>
                      </div>
                      <p className="text-body text-xs leading-relaxed">
                        {tool.whyWeUseIt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA Band */}
        <section className="pt-6">
          <CtaBand
            headline="Have a specific tech stack in mind?"
            description="Our engineers adapt to your architecture constraints. Let's discuss compatibility and integration feasibility."
            primaryAction={{ label: "Scope Your Stack", href: "/contact" }}
            secondaryAction={{ label: "Book a Consultation", href: "/book" }}
          />
        </section>
      </div>
    </main>
  );
}
