import { describe, expect, it } from "vitest";
import { foldVCardLines, generateSyntheticVCards, unfoldVCardLines } from "../lib/vcard-text-tools";

describe("vCard text utilities", () => {
  it("folds and unfolds long lines reversibly", () => {
    const source = `FN:${"x".repeat(120)}`;
    const folded = foldVCardLines(source);
    expect(folded).toContain("\r\n ");
    expect(unfoldVCardLines(folded)).toBe(source);
  });

  it("generates bounded synthetic files", () => {
    const output = generateSyntheticVCards(3, "4.0");
    expect((output.match(/BEGIN:VCARD/g) ?? []).length).toBe(3);
    expect(output).toContain("VERSION:4.0");
    expect(output).toContain("example.test");
  });
});
