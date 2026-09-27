import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { formats, guides, platforms } from "../lib/content-registry";
import { tools } from "../lib/tools-registry";
import { GET as getSitemap } from "../app/sitemap.xml/route";

function unique(values: string[]) { return new Set(values).size === values.length; }

describe("content and tool registry quality", () => {
  it("has unique indexable slugs", () => {
    expect(unique(tools.map((tool) => tool.slug))).toBe(true);
    expect(unique(guides.map((page) => page.slug))).toBe(true);
    expect(unique(formats.map((page) => page.slug))).toBe(true);
    expect(unique(platforms.map((page) => page.slug))).toBe(true);
  });

  it("has substantive metadata and reviewed content", () => {
    [...guides, ...formats, ...platforms].forEach((page) => {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.intro.length).toBeGreaterThan(60);
      expect(page.sections.length).toBeGreaterThan(0);
      expect(page.lastReviewed).toMatch(/^2026-/);
    });
  });

  it("does not publish broken internal links from content pages", () => {
    const valid = new Set([
      "/tools", "/guide", "/format", "/platform", "/about", "/author", "/how-it-works", "/privacy", "/cookies", "/terms", "/security", "/browser-support", "/accessibility", "/contact", "/changelog", "/sitemap",
      ...tools.map((tool) => `/tool/${tool.slug}`),
      ...guides.map((page) => `/guide/${page.slug}`),
      ...formats.map((page) => `/format/${page.slug}`),
      ...platforms.map((page) => `/platform/${page.slug}`),
    ]);
    [...guides, ...formats, ...platforms].flatMap((page) => page.related.map((link) => link.href)).filter((href) => href.startsWith("/")).forEach((href) => expect(valid.has(href), href).toBe(true));
  });

  it("keeps the complete README tool catalogue routed and implemented", () => {
    const readme = readFileSync("VCARDEDITOR_MASTER_README.md", "utf8");
    const documented = new Set(Array.from(readme.matchAll(/\/tool\/([a-z0-9-]+)/g), (match) => match[1]));
    const registered = new Set(tools.map((tool) => tool.slug));
    expect([...documented].filter((slug) => !registered.has(slug))).toEqual([]);
    expect(tools.filter((tool) => tool.status === "planned")).toEqual([]);
    tools.forEach((tool) => {
      expect(tool.name.length).toBeGreaterThan(4);
      expect(tool.description.length).toBeGreaterThan(25);
      expect(tool.processorId.length).toBeGreaterThan(2);
    });
    [...documented].forEach((slug) => expect(tools.find((tool) => tool.slug === slug)?.indexable, slug).toBe(true));
    expect(tools.filter((tool) => !tool.indexable).map((tool) => tool.slug).sort()).toEqual(["extract-email-addresses", "extract-phone-numbers"]);
  });

  it("publishes one canonical page for each exact content intent", () => {
    const normalize = (value: string) => value.toLowerCase().replace(/\s*[|—-]\s*vcard editor$/i, "").replace(/[^a-z0-9]+/g, " ").trim();
    const intents = [...guides, ...formats, ...platforms].map((page) => normalize(page.metaTitle));
    expect(unique(intents)).toBe(true);
  });

  it("does not reuse editorial paragraphs across indexable content pages", () => {
    const paragraphs = [...guides, ...formats, ...platforms].flatMap((page) => page.sections.flatMap((section) => section.paragraphs));
    expect(unique(paragraphs)).toBe(true);
  });

  it("keeps share metadata attached to indexable content routes", () => {
    const guideRoute = readFileSync("app/guide/[slug]/page.tsx", "utf8");
    const formatRoute = readFileSync("app/format/[slug]/page.tsx", "utf8");
    const platformRoute = readFileSync("app/platform/[slug]/page.tsx", "utf8");
    const toolRoute = readFileSync("app/tool/[slug]/page.tsx", "utf8");
    expect(toolRoute).toContain("toolPageMetadata");
    const toolMetadata = readFileSync("lib/page-metadata.ts", "utf8");
    [guideRoute, formatRoute, platformRoute, toolMetadata].forEach((source) => {
      expect(source).toContain("openGraph");
      expect(source).toContain("twitter");
      expect(source).toContain("opengraph-image");
    });
    expect(readFileSync("components/content-page.tsx", "utf8")).toContain("dateModified");
    expect(readFileSync("components/content-page.tsx", "utf8")).toContain("author");
  });

  it("keeps redirects and non-indexable aliases out of the sitemap", async () => {
    const xml = await getSitemap().text();
    expect(xml).toContain("/guide/import-vcf-google-contacts</loc>");
    expect(xml).toContain("/tool/extract-phone-numbers-from-vcf</loc>");
    expect(xml).not.toContain("/platform/import-vcf-google-contacts</loc>");
    expect(xml).not.toContain("/platform/google-contacts-import-vcf</loc>");
    expect(xml).not.toContain("/tool/extract-phone-numbers</loc>");
    expect(xml).not.toContain("/tool/extract-email-addresses</loc>");
  });
});
