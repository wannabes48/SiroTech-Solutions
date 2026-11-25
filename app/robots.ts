import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { areaForHost } from "@/lib/hosts";
import { SITE_URL } from "@/lib/site";

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
