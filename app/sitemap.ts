import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ROUTES } from "@/lib/assistant/routes";
import { areaForHost } from "@/lib/hosts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sirotech.vercel.app";

// Auth and portal pages live on portal.* / admin.* and must not be listed.
const NON_PUBLIC = /^\/(portal|admin|sign-in|sign-up|forgot-password|reset-password|verify-email|invite)(\/|$)/;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only the main host publishes a sitemap.
  if (areaForHost((await headers()).get("host")) !== "site") return [];

  const now = new Date();
  return ROUTES.filter((route) => !NON_PUBLIC.test(route)).map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : route.startsWith("/services") || route === "/pricing" ? 0.8 : 0.6,
  }));
}
