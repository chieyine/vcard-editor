import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("launch surface", () => {
  it("contains the required launch routes", () => {
    const routes = ["app/tool/[slug]/page.tsx", "app/about/page.tsx", "app/author/page.tsx", "app/sitemap/page.tsx"];
    routes.forEach((route) => expect(existsSync(route), route).toBe(true));
  });
});
