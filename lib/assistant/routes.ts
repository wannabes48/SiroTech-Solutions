/**
 * Route allowlist for SiroTech Site Assistant.
 * Generated from verified sitemap and dynamic routes.
 */

export const ROUTES = [
  "/",
  "/services",
  "/services/custom-software",
  "/services/web-application-development",
  "/services/mobile-apps",
  "/services/ai-automation",
  "/services/cloud-devops",
  "/services/ui-ux-design",
  "/services/api-integrations",
  "/services/database-architecture",
  "/services/ecommerce-solutions",
  "/services/cybersecurity",
  "/services/legacy-migration",
  "/solutions",
  "/solutions/erp",
  "/solutions/crm",
  "/solutions/fintech",
  "/solutions/fleet",
  "/solutions/agritech",
  "/solutions/supply-chain",
  "/pricing",
  "/process",
  "/work",
  "/testimonials",
  "/technologies",
  "/blog",
  "/faq",
  "/about",
  "/careers",
  "/contact",
  "/book",
  "/legal/privacy",
  "/legal/terms",
] as const;

export type AppRoute = (typeof ROUTES)[number];

export function isValidRoute(path: string): boolean {
  if (!path) return false;
  const clean = path.split("?")[0].trim();
  return (ROUTES as readonly string[]).includes(clean);
}
