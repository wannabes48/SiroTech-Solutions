export interface ValueItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
}

export const studioValues: ValueItem[] = [
  {
    id: "structural-discipline",
    title: "Structural Discipline",
    tagline: "Architecture over fragile shortcuts.",
    description: "Borrowing from structural engineering rigor: we plan load-bearing data schemas, decouple business logic, and test boundary conditions before writing production code.",
    badge: "01 / Engineering",
  },
  {
    id: "radical-transparency",
    title: "Radical Transparency",
    tagline: "Clear pricing, open code, zero black boxes.",
    description: "You retain 100% intellectual property, continuous repository access, transparent milestone-based invoices, and direct communication with developers without middlemen.",
    badge: "02 / Trust",
  },
  {
    id: "high-load-resilience",
    title: "High-Load Resilience",
    tagline: "Built to perform under real African and global concurrency.",
    description: "From volatile mobile network connections to peak-hour payment surges, our applications are optimized for edge caching, offline sync, and sub-second responses.",
    badge: "03 / Performance",
  },
  {
    id: "commercial-focus",
    title: "Commercial Value Focus",
    tagline: "We measure software by business growth, not code volume.",
    description: "Every architectural choice is evaluated by its ROI: does it improve user conversion, accelerate deployment cycles, or reduce infrastructure operating expenses?",
    badge: "04 / Impact",
  },
];
