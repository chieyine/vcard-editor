import { formats, guides, platforms } from "../../lib/content-registry";
import { isPreviewDeployment } from "../../lib/feature-flags";
import { siteUrl } from "../../lib/site-config";
import { tools } from "../../lib/tools-registry";

export function GET() {
  if (isPreviewDeployment) return new Response("", { status: 200, headers: { "content-type": "application/xml; charset=utf-8" } });
  const routes = ["", "/tools", "/guide", "/format", "/platform", "/about", "/author", "/sitemap", "/how-it-works", "/privacy", "/security", "/accessibility", "/browser-support", "/terms", "/cookies", "/contact", "/changelog", ...tools.filter((tool) => tool.indexable).map((tool) => `/tool/${tool.slug}`), ...guides.map((page) => `/guide/${page.slug}`), ...formats.map((page) => `/format/${page.slug}`), ...platforms.map((page) => `/platform/${page.slug}`)];
  const body = routes.map((route) => `<url><loc>${siteUrl}${route}</loc><lastmod>2026-08-11</lastmod><changefreq>monthly</changefreq><priority>${route === "" ? "1" : "0.6"}</priority></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
