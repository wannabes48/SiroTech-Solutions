/**
 * Canonical public origin of the marketing site (no trailing slash).
 * Used for metadata, canonical URLs, sitemap/robots and JSON-LD structured data.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sirotech.co.ke").replace(/\/+$/, "");
