"use client";

import React, { useState } from "react";
import { InfiniteSlider } from "@/components/ui/logo-marquee";

interface Technology {
  name: string;
  category: string;
  src: string;
  fallbackSrc: string;
}

const technologies: Technology[] = [
  {
    name: "TypeScript",
    category: "Language",
    src: "/tech/typescript.webp",
    fallbackSrc: "https://iconlogovector.com/uploads/images/2024/04/lg-661dcd60dabf7-TypeScript.webp",
  },
  {
    name: "React",
    category: "Frontend",
    src: "/tech/react.png",
    fallbackSrc: "https://www.freelogovectors.net/wp-content/uploads/2023/02/react-logo-freelogovectors.net_.png",
  },
  {
    name: "Next.js",
    category: "Full-Stack",
    src: "/tech/nextjs.png",
    fallbackSrc: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/2/nextjs-dqhvgu9iwvacgwnwl8bs25.png/nextjs-ghnqttyc6ffbnqnn8xlrpj.png?_a=DATAiZAAZAA0",
  },
  {
    name: "Node.js",
    category: "Runtime",
    src: "/tech/nodejs.png",
    fallbackSrc: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/960px-Node.js_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20170401104355",
  },
  {
    name: "PostgreSQL",
    category: "Database",
    src: "/tech/postgresql.png",
    fallbackSrc: "https://images.icon-icons.com/2415/PNG/512/postgresql_plain_wordmark_logo_icon_146390.png",
  },
  {
    name: "Python",
    category: "AI & Backend",
    src: "/tech/python.png",
    fallbackSrc: "https://images.icon-icons.com/2699/PNG/512/python_vertical_logo_icon_168039.png",
  },
  {
    name: "Flutter",
    category: "Mobile",
    src: "/tech/flutter.png",
    fallbackSrc: "https://upload.wikimedia.org/wikipedia/commons/1/17/Google-flutter-logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  },
  {
    name: "AWS",
    category: "Cloud",
    src: "/tech/aws.png",
    fallbackSrc: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1280px-Amazon_Web_Services_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail",
  },
];

function TechCard({ tech }: { tech: Technology }) {
  const [imgSrc, setImgSrc] = useState(tech.src);

  return (
    <div
      className="w-36 sm:w-44 shrink-0 group relative flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface/60 border border-rule/80 hover:bg-white hover:border-sage-300 hover:shadow-xs transition-all duration-300 cursor-default min-h-[96px] sm:min-h-[104px]"
      title={`${tech.name} — ${tech.category}`}
    >
      {/* Logo container with strict optical alignment */}
      <div className="h-10 sm:h-11 w-full flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={`${tech.name} logo`}
          loading="lazy"
          onError={() => {
            if (imgSrc !== tech.fallbackSrc) {
              setImgSrc(tech.fallbackSrc);
            }
          }}
          className="max-h-7 sm:max-h-8 max-w-[85%] w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
        />
      </div>

      {/* Label and Category */}
      <div className="flex flex-col items-center mt-1.5 w-full">
        <span className="text-[11px] sm:text-xs font-semibold text-ink/90 group-hover:text-ink transition-colors tracking-tight text-center leading-tight">
          {tech.name}
        </span>
        <span className="text-[10px] text-muted tracking-tight text-center hidden sm:block">
          {tech.category}
        </span>
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section
      id="trust"
      className="w-full bg-white py-12 sm:py-16 border-b border-rule scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted mb-2">
            Technologies we build with
          </p>
          <p className="text-xs sm:text-sm text-body/80 max-w-lg">
            Battle-tested frameworks, modern runtimes, and resilient cloud infrastructure powering our client platforms
          </p>
        </div>

        {/* Infinite Marquee Slider with edge masks */}
        <div className="relative w-full overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <InfiniteSlider gap={20} duration={35} durationOnHover={85} reverse={false}>
            {technologies.map((tech) => (
              <TechCard key={tech.name} tech={tech} />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
