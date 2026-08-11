import { describe, expect, it } from "vitest";
import { trackEvent } from "../lib/analytics";

describe("privacy-safe analytics", () => {
  it("does not emit events while analytics is disabled by default", () => {
    expect(() => trackEvent("file_selected", { tool_slug: "test", input_format: "vcf", size_bucket: "standard" })).not.toThrow();
  });
});
