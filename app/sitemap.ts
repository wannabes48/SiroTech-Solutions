import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/assistant/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sirotech.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : route.startsWith("/services") || route === "/pricing" ? 0.8 : 0.6,
  }));
}
