"use client";

import React, { useState } from "react";
import { Check, Copy, AlertTriangle, Info, Lightbulb } from "lucide-react";

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy code", err);
    }
  };

  return (
    <div className="relative my-8 rounded-2xl bg-ink text-white font-mono text-xs sm:text-sm overflow-hidden border border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ArticleBody({ content }: { content: string }) {
  // Parse markdown into clean blocks
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = "";
  let paragraphBuffer: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];

    if (!text) return;

    // Check for callouts
    if (text.startsWith("> [!NOTE]")) {
      const calloutText = text.replace("> [!NOTE]", "").trim();
      elements.push(
        <div
          key={key}
          className="my-6 p-5 rounded-2xl bg-sage-100 border border-sage-300 text-ink flex items-start gap-3.5"
        >
          <Info className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{calloutText}</p>
        </div>
      );
      return;
    }

    if (text.startsWith("> [!TIP]")) {
      const calloutText = text.replace("> [!TIP]", "").trim();
      elements.push(
        <div
          key={key}
          className="my-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3.5"
        >
          <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{calloutText}</p>
        </div>
      );
      return;
    }

    if (text.startsWith("> [!WARNING]")) {
      const calloutText = text.replace("> [!WARNING]", "").trim();
      elements.push(
        <div
          key={key}
          className="my-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3.5"
        >
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{calloutText}</p>
        </div>
      );
      return;
    }

    // Standard paragraph with bold/code formatting
    elements.push(
      <p key={key} className="text-body text-base sm:text-lg leading-relaxed my-5">
        {formatInlineMarkdown(text)}
      </p>
    );
  };

  function formatInlineMarkdown(str: string): React.ReactNode {
    // Basic inline code & bold
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-sage-200/80 text-ink text-sm font-mono font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join("\n")}
            language={codeLanguage}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = "";
      } else {
        flushParagraph(`p-${i}`);
        inCodeBlock = true;
        codeLanguage = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("## ")) {
      flushParagraph(`p-${i}`);
      const headingText = line.replace("## ", "").trim();
      const id = slugify(headingText);
      elements.push(
        <h2
          key={`h2-${i}`}
          id={id}
          className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-12 mb-4 scroll-mt-28"
        >
          {headingText}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph(`p-${i}`);
      const headingText = line.replace("### ", "").trim();
      const id = slugify(headingText);
      elements.push(
        <h3
          key={`h3-${i}`}
          id={id}
          className="text-xl sm:text-2xl font-bold text-ink mt-8 mb-3 scroll-mt-28"
        >
          {headingText}
        </h3>
      );
      continue;
    }

    // Bullet lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph(`p-${i}`);
      const itemText = line.replace(/^[-*]\s+/, "");
      elements.push(
        <li key={`li-${i}`} className="text-body text-base sm:text-lg leading-relaxed ml-6 list-disc my-1.5">
          {formatInlineMarkdown(itemText)}
        </li>
      );
      continue;
    }

    // Empty lines trigger paragraph flush
    if (!line.trim()) {
      flushParagraph(`p-${i}`);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph("p-final");

  return <div className="article-body max-w-none">{elements}</div>;
}
