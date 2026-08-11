import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { formats, guides, platforms } from "../lib/content-registry";
import { tools } from "../lib/tools-registry";

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
      expect(tool.indexable).toBe(true);
    });
  });
});
