import React from "react";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function styleObjectToString(style: React.CSSProperties | Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || value === null || value === "") continue;
    let cssProp = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (cssProp.startsWith("webkit-")) {
      cssProp = `-${cssProp}`;
    }
    parts.push(`${cssProp}: ${value}`);
  }
  return parts.join("; ");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Pure TypeScript JSX-to-HTML serializer for email rendering.
 * Eliminates dependency on react-dom/server to comply with Next.js 15+ / 16+ Turbopack restrictions.
 */
export function renderToHtml(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string") {
    return escapeHtml(node);
  }

  if (typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(renderToHtml).join("");
  }

  if (React.isValidElement(node)) {
    const { type, props } = node as React.ReactElement<any>;

    // Handle React.Fragment
    if (type === React.Fragment) {
      return renderToHtml(props.children);
    }

    // Handle Functional Components
    if (typeof type === "function") {
      try {
        const rendered = (type as any)(props);
        return renderToHtml(rendered);
      } catch (err) {
        console.error("[renderToHtml] Error rendering component:", type.name || type, err);
        return "";
      }
    }

    // Handle standard DOM elements (table, tr, td, div, p, a, etc.)
    if (typeof type === "string") {
      const tag = type.toLowerCase();
      const attrParts: string[] = [];
      let innerHtml: string | undefined = undefined;

      for (const [key, val] of Object.entries(props)) {
        if (key === "children" || key === "key" || key === "ref") {
          continue;
        }

        if (key === "dangerouslySetInnerHTML" && val && typeof val === "object" && "__html" in val) {
          innerHtml = String((val as any).__html || "");
          continue;
        }

        if (key === "style" && val && typeof val === "object") {
          const styleStr = styleObjectToString(val);
          if (styleStr) {
            attrParts.push(`style="${escapeAttr(styleStr)}"`);
          }
          continue;
        }

        if (key === "className") {
          if (val) attrParts.push(`class="${escapeAttr(String(val))}"`);
          continue;
        }

        if (typeof val === "boolean") {
          if (val) attrParts.push(key);
          continue;
        }

        if (val !== undefined && val !== null) {
          attrParts.push(`${key}="${escapeAttr(String(val))}"`);
        }
      }

      const attrs = attrParts.length > 0 ? " " + attrParts.join(" ") : "";

      if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrs} />`;
      }

      const content = innerHtml !== undefined ? innerHtml : renderToHtml(props.children);
      return `<${tag}${attrs}>${content}</${tag}>`;
    }
  }

  return "";
}
