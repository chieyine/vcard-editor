import type { MetadataRoute } from "next";
import { isPreviewDeployment } from "../lib/feature-flags";
import { siteUrl } from "../lib/site-config";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
