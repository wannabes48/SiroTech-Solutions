import Link from "next/link";
import { work } from "@/data/work";
import { Carousel } from "./ui/Carousel";
import { SectionHeader } from "./ui/SectionHeader";
import { ArrowRight } from "lucide-react";

const images = [
  "/projects/trav-tatz/screen-1.png",
  "/projects/coastlane/screen-1.png",
  "/projects/foresafe/screen-1.png",
];

export default function WorkShowcase() {
  const topProjects = work.slice(0, 3);

  return (
    <section id="work" className="py-24 bg-bg overflow-hidden border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        {/* Centred Header */}
        <SectionHeader
          align="center"
          label="Work Showcase"
          heading="Case Studies and Success Stories"
          description="We build systems that deliver quantifiable business results. Explore our flagship production deliveries."
        />

        {/* Carousel of WorkCards */}
        <Carousel itemWidth={400} className="mb-12">
          {topProjects.map((project, idx) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="block w-[85vw] sm:w-[380px] group cursor-pointer"
            >
              {/* Image Container with 24px radius */}
              <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden relative mb-4 bg-surface border border-rule">
                <img
                  src={images[idx % images.length]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Small caption + Bold Title */}
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider mb-1 font-semibold">
                  {project.industry} • {project.year}
                </p>
                <h3 className="text-lg font-bold text-ink group-hover:text-sage-700 transition-colors">
                  {project.title}
                </h3>
              </div>
            </Link>
          ))}
        </Carousel>

        {/* View all pill → /work */}
        <div className="flex justify-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-sage-300 text-ink text-xs font-bold uppercase tracking-wider hover:bg-sage-100 transition-colors shadow-xs"
          >
            <span>View All Case Studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
