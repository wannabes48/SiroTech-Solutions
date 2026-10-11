import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "../ui/SectionHeader";

const latestPosts = [
  {
    title: "Scaling Next.js Applications on Edge Infrastructure",
    category: "Architecture",
    date: "Oct 12, 2026",
    readingTime: "5 min read",
    slug: "scaling-nextjs",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "PostgreSQL Indexing & Sharding for High Concurrency",
    category: "Database",
    date: "Sep 28, 2026",
    readingTime: "8 min read",
    slug: "postgres-indexing",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Building Offline-First Mobile Apps with React Native",
    category: "Mobile",
    date: "Sep 15, 2026",
    readingTime: "6 min read",
    slug: "offline-first-react-native",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
  },
];

export default function BlogTeaser() {
  return (
    <section className="py-24 bg-surface border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <SectionHeader
          label="Technical Blog"
          heading="Latest Insights &amp; Engineering Decisions"
          description="In-depth technical writeups on system architecture, database optimization, and modern product engineering."
          action={
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-ink font-semibold hover:text-sage-700 text-sm transition-colors"
            >
              <span>Explore all articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block cursor-pointer"
            >
              <div className="w-full aspect-[4/3] rounded-[24px] overflow-hidden relative mb-5 bg-bg border border-rule">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-ink text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                  {post.category}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mb-2.5 font-medium uppercase tracking-wider">
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-rule" />
                <span>{post.readingTime}</span>
              </div>
              <h3 className="text-lg font-bold text-ink group-hover:text-sage-700 transition-colors leading-snug">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
