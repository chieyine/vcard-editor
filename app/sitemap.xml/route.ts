import { formats, guides, platforms } from "../../lib/content-registry";
import { isPreviewDeployment } from "../../lib/feature-flags";
import { siteUrl } from "../../lib/site-config";
import { tools } from "../../lib/tools-registry";
import { release } from "../../lib/release";

export function GET() {
  if (isPreviewDeployment) return new Response("", { status: 200, headers: { "content-type": "application/xml; charset=utf-8" } });
  const staticRoutes = ["", "/tools", "/guide", "/format", "/platform", "/about", "/author", "/sitemap", "/how-it-works", "/privacy", "/security", "/accessibility", "/browser-support", "/terms", "/cookies", "/contact", "/changelog"].map((path) => ({ path, lastModified: release.date }));
  const routes = [...staticRoutes, ...tools.filter((tool) => tool.indexable).map((tool) => ({ path: `/tool/${tool.slug}`, lastModified: release.date })), ...guides.map((page) => ({ path: `/guide/${page.slug}`, lastModified: page.lastReviewed })), ...formats.map((page) => ({ path: `/format/${page.slug}`, lastModified: page.lastReviewed })), ...platforms.map((page) => ({ path: `/platform/${page.slug}`, lastModified: page.lastReviewed }))];
  const body = routes.map(({ path, lastModified }) => `<url><loc>${siteUrl}${path}</loc><lastmod>${lastModified}</lastmod></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
