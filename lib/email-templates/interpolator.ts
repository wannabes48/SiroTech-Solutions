/**
 * Variable interpolation and validation engine for SiroTech email templates.
 * Supports both flat tokens ({{name}}) and nested dot paths ({{invoice.number}}).
 */

/**
 * Extracts a nested property value using a dot-path string (e.g. "invoice.number").
 */
function getValueByPath(obj: Record<string, any>, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  // Direct match
  if (path in obj && obj[path] !== undefined && obj[path] !== null) {
    return String(obj[path]);
  }

  // Underscore fallback (e.g. "invoice_number" -> "invoice.number")
  const dotPath = path.replace(/_/g, ".");
  const underscorePath = path.replace(/\./g, "_");

  if (dotPath in obj && obj[dotPath] !== undefined && obj[dotPath] !== null) {
    return String(obj[dotPath]);
  }
  if (underscorePath in obj && obj[underscorePath] !== undefined && obj[underscorePath] !== null) {
    return String(obj[underscorePath]);
  }

  // Nested property lookup
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current !== undefined && current !== null ? String(current) : undefined;
}

/**
 * Interpolates variables in a template string using a data dictionary.
 * Replaces {{key}} or {{object.property}} with matching values.
 */
export function interpolate(templateText: string, data: Record<string, any>): string {
  if (!templateText) return "";
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, token) => {
    const value = getValueByPath(data, token.trim());
    return value !== undefined ? value : match;
  });
}

/**
 * Extracts all unique variable names from a template string.
 * Example: "Hello {{name}}, your invoice {{invoice.number}} is ready" -> ["name", "invoice.number"]
 */
export function extractVariables(templateText: string): string[] {
  if (!templateText) return [];
  const matches = templateText.match(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g) || [];
  const tokens = matches.map((m) => m.replace(/[\{\}\s]/g, "").trim());
  return Array.from(new Set(tokens));
}

/**
 * Normalizes variable token (e.g. treats invoice.number and invoice_number as equivalent)
 */
function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

/**
 * Validates whether all variables in a template string belong to an allowed token list.
 */
export function validateTemplateVariables(
  templateText: string,
  allowedTokens: string[]
): { isValid: boolean; invalidTokens: string[] } {
  const usedTokens = extractVariables(templateText);
  const normalizedAllowed = new Set(
    allowedTokens.flatMap((t) => [
      normalizeToken(t),
      normalizeToken(t.replace(/\./g, "_")),
      normalizeToken(t.replace(/_/g, ".")),
    ])
  );

  const invalidTokens = usedTokens.filter((token) => !normalizedAllowed.has(normalizeToken(token)));

  return {
    isValid: invalidTokens.length === 0,
    invalidTokens,
  };
}
