import React from "react";

const technologies = [
  { name: "TypeScript", color: "hover:text-[#3178C6]" },
  { name: "React", color: "hover:text-[#61DAFB]" },
  { name: "Next.js", color: "hover:text-ink" },
  { name: "Node.js", color: "hover:text-[#5FA04E]" },
  { name: "PostgreSQL", color: "hover:text-[#4169E1]" },
  { name: "Python", color: "hover:text-[#3776AB]" },
  { name: "Flutter", color: "hover:text-[#02569B]" },
  { name: "AWS", color: "hover:text-[#FF9900]" },
];

export default function TechMarquee() {
  return (
    <section
      id="trust"
      className="w-full bg-white py-12 border-b border-rule scroll-mt-24"
    >
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted mb-8">
          Technologies we build with
        </p>

        {/* Responsive Strip (grid on desktop/tablet, marquee on small mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-8 items-center justify-items-center">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className={`flex items-center gap-2 text-sm sm:text-base font-bold text-muted/70 grayscale transition-all duration-300 hover:grayscale-0 hover:scale-105 cursor-default ${tech.color}`}
            >
              <span className="w-2 h-2 rounded-full bg-sage-500/50 inline-block" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
