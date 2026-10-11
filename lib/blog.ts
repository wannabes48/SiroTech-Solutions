import fs from "fs";
import path from "path";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  cover: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  featured: boolean;
  content: string;
  readingTime: string;
  toc: TocItem[];
}

export interface BlogCategory {
  slug: string;
  label: string;
  count: number;
}

function getBlogDirectories(): string[] {
  return [
    path.join(process.cwd(), "content", "blog"),
    path.join(process.cwd(), "src", "content", "blog"),
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function calculateReadingTime(text: string): string {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
}

function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.*)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    // Strip markdown formatting if any
    const cleanText = rawText.replace(/[*_`]/g, "");
    items.push({
      id: slugify(cleanText),
      text: cleanText,
      level,
    });
  }

  return items;
}

function parseMdxFile(filePath: string, slug: string): BlogPost {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const frontmatterMatch = fileContent.match(/^---\s*([\s\S]*?)\s*---/);

  let rawFrontmatter = "";
  let body = fileContent;

  if (frontmatterMatch) {
    rawFrontmatter = frontmatterMatch[1];
    body = fileContent.replace(frontmatterMatch[0], "").trim();
  }

  // Parse fields
  const getField = (regex: RegExp, fallback = ""): string => {
    const m = rawFrontmatter.match(regex);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : fallback;
  };

  const title = getField(/title:\s*(.*)/i, "Engineering Article");
  const excerpt = getField(/excerpt:\s*(.*)/i, "");
  const date = getField(/date:\s*(.*)/i, "2026-10-01");
  const category = getField(/category:\s*(.*)/i, "architecture");
  const categoryLabel = getField(/categoryLabel:\s*(.*)/i, "Engineering");
  const cover = getField(/cover:\s*(.*)/i, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200");
  const author = getField(/author:\s*(.*)/i, "Brian Kiprono");
  const authorRole = getField(/authorRole:\s*(.*)/i, "Principal Systems Architect");
  const authorAvatar = getField(/authorAvatar:\s*(.*)/i, "BK");
  const featured = /featured:\s*true/i.test(rawFrontmatter);

  // Parse tags array
  const tagsMatch = rawFrontmatter.match(/tags:\s*\[([\s\S]*?)\]/i);
  let tags: string[] = ["Engineering", "TypeScript"];
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(",")
      .map((t) => t.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return {
    slug,
    title,
    excerpt,
    date,
    category,
    categoryLabel,
    tags,
    cover,
    author,
    authorRole,
    authorAvatar,
    featured,
    content: body,
    readingTime: calculateReadingTime(body),
    toc: extractToc(body),
  };
}

export function getAllPosts(): BlogPost[] {
  const postsMap = new Map<string, BlogPost>();

  for (const dir of getBlogDirectories()) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (file.endsWith(".mdx") || file.endsWith(".md")) {
        const slug = file.replace(/\.(mdx|md)$/, "");
        if (!postsMap.has(slug)) {
          const post = parseMdxFile(path.join(dir, file), slug);
          postsMap.set(slug, post);
        }
      }
    }
  }

  return Array.from(postsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  for (const dir of getBlogDirectories()) {
    const fullPath = path.join(dir, `${slug}.mdx`);
    if (fs.existsSync(fullPath)) {
      return parseMdxFile(fullPath, slug);
    }
    const mdPath = path.join(dir, `${slug}.md`);
    if (fs.existsSync(mdPath)) {
      return parseMdxFile(mdPath, slug);
    }
  }
  return undefined;
}

export function getFeaturedPost(): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.featured) || posts[0];
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return getAllPosts().filter(
    (p) => p.category.toLowerCase() === categorySlug.toLowerCase()
  );
}

export function getRelatedPosts(currentSlug: string, tags: string[]): BlogPost[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);
  return all
    .map((post) => {
      const common = post.tags.filter((t) => tags.includes(t)).length;
      return { post, score: common };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post)
    .slice(0, 3);
}

export function getAllCategories(): BlogCategory[] {
  const posts = getAllPosts();
  const counts = new Map<string, { label: string; count: number }>();

  for (const p of posts) {
    const cur = counts.get(p.category) || { label: p.categoryLabel, count: 0 };
    counts.set(p.category, { label: p.categoryLabel, count: cur.count + 1 });
  }

  return Array.from(counts.entries()).map(([slug, data]) => ({
    slug,
    label: data.label,
    count: data.count,
  }));
}
