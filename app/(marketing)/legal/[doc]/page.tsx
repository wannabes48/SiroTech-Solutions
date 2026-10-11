import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Calendar, Shield, FileText, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

const legalDocsList = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
  { slug: "cookies", label: "Cookie Policy" },
  { slug: "accessibility", label: "Accessibility Statement" },
  { slug: "refunds", label: "Refunds & Cancellations" },
];

function getDocPath(slug: string): string | null {
  const paths = [
    path.join(process.cwd(), "src", "content", "legal", `${slug}.mdx`),
    path.join(process.cwd(), "content", "legal", `${slug}.mdx`),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function parseMdx(content: string) {
  let title = "Legal Document";
  let lastUpdated = "October 2026";
  let description = "";

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  let body = content;

  if (frontmatterMatch) {
    const rawFm = frontmatterMatch[1];
    body = content.replace(frontmatterMatch[0], "").trim();

    const titleMatch = rawFm.match(/title:\s*(.*)/i);
    const dateMatch = rawFm.match(/lastUpdated:\s*(.*)/i);
    const descMatch = rawFm.match(/description:\s*(.*)/i);

    if (titleMatch) title = titleMatch[1].trim();
    if (dateMatch) lastUpdated = dateMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();
  }

  // Extract headings for Table of Contents
  const toc: TocItem[] = [];
  const lines = body.split("\n");

  lines.forEach((line) => {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      const headingText = h2Match[1].trim();
      toc.push({
        id: slugify(headingText),
        title: headingText,
        level: 2,
      });
    }
  });

  return { title, lastUpdated, description, body, toc };
}

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "content", "legal");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ doc: f.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const filePath = getDocPath(doc);
  if (!filePath) return { title: "Document Not Found" };

  const raw = fs.readFileSync(filePath, "utf8");
  const { title, description } = parseMdx(raw);

  return {
    title: `${title} | SiroTech Solutions`,
    description: description || `Legal documentation and compliance terms for SiroTech Solutions.`,
  };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const filePath = getDocPath(doc);

  if (!filePath) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { title, lastUpdated, description, body, toc } = parseMdx(fileContent);

  // Render markdown lines to styled JSX
  const renderContent = () => {
    const lines = body.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="space-y-2.5 my-5 pl-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-body text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700 mt-2 shrink-0" />
                <span>
                  {item.split("**").map((chunk, cIdx) =>
                    cIdx % 2 === 1 ? (
                      <strong key={cIdx} className="font-semibold text-ink">
                        {chunk}
                      </strong>
                    ) : (
                      chunk
                    )
                  )}
                </span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 2
      if (trimmed.startsWith("## ")) {
        flushList();
        const heading = trimmed.replace("## ", "");
        const id = slugify(heading);
        elements.push(
          <h2
            key={`h2-${idx}`}
            id={id}
            className="text-2xl sm:text-3xl font-bold text-ink mt-12 mb-4 scroll-mt-28 border-b border-rule/60 pb-2"
          >
            {heading}
          </h2>
        );
        return;
      }

      // Heading 3
      if (trimmed.startsWith("### ")) {
        flushList();
        const heading = trimmed.replace("### ", "");
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg sm:text-xl font-bold text-ink mt-8 mb-3 scroll-mt-28"
          >
            {heading}
          </h3>
        );
        return;
      }

      // Unordered list item
      if (trimmed.startsWith("- ")) {
        currentList.push(trimmed.replace(/^- /, ""));
        return;
      }

      // Paragraph
      if (trimmed.length > 0) {
        flushList();
        elements.push(
          <p key={`p-${idx}`} className="text-body text-sm sm:text-base leading-relaxed my-4">
            {trimmed.split("**").map((chunk, cIdx) =>
              cIdx % 2 === 1 ? (
                <strong key={cIdx} className="font-semibold text-ink">
                  {chunk}
                </strong>
              ) : (
                chunk
              )
            )}
          </p>
        );
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return (
    <main className="min-h-screen bg-bg">
      {/* Top Header */}
      <div className="bg-sage-700 text-white">
        <Navbar />
        <div className="max-w-[1248px] mx-auto px-6 lg:px-10 pt-16 pb-24">
          <div className="max-w-3xl">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Legal Center", href: "/legal/privacy" },
                { label: title },
              ]}
              className="text-sage-100 mb-6 [&_span]:text-white [&_a]:text-sage-100"
            />
            <h1 className="text-display text-white mb-4 leading-tight">{title}</h1>
            {description && (
              <p className="text-sage-100 text-base sm:text-lg leading-relaxed mb-6">
                {description}
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white/90">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Document Body */}
          <article className="lg:col-span-8 bg-surface rounded-[28px] p-8 sm:p-12 border border-rule shadow-xs">
            {renderContent()}
          </article>

          {/* Sticky Sidebar: Table of Contents & Navigation */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="sticky top-28 bg-surface rounded-[24px] p-6 border border-rule space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted pb-3 border-b border-rule">
                  <FileText className="w-4 h-4 text-sage-700" />
                  <span>On This Page</span>
                </div>
                <nav className="space-y-1.5">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-xs sm:text-sm text-body hover:text-sage-700 py-1 transition-colors leading-snug"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>

                {/* All Legal Documents Links */}
                <div className="pt-6 border-t border-rule space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                    <Shield className="w-4 h-4 text-sage-700" />
                    <span>Legal Documents</span>
                  </div>
                  <div className="space-y-1">
                    {legalDocsList.map((docItem) => {
                      const isActive = docItem.slug === doc;
                      return (
                        <Link
                          key={docItem.slug}
                          href={`/legal/${docItem.slug}`}
                          className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl font-medium transition-colors ${
                            isActive
                              ? "bg-sage-100 text-sage-800 font-bold"
                              : "text-body hover:bg-bg hover:text-ink"
                          }`}
                        >
                          <span>{docItem.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
