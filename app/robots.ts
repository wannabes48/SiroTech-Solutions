import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { areaForHost } from "@/lib/hosts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sirotech.vercel.app";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // portal.* and admin.* are never crawled (pages also send X-Robots-Tag: noindex from middleware).
  if (areaForHost((await headers()).get("host")) !== "site") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal", "/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
