import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseVCard, serializeVCards } from "../lib/vcard";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("vCard engine golden fixtures", () => {
  it("parses quoted-printable Unicode and vCard 2.1", () => {
    const result = parseVCard(fixture("clean-2-1.vcf").replace(/\n/g, "\r\n"));
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].formattedName).toBe("José Doe");
    expect(result.contacts[0].version).toBe("2.1");
    expect(result.lineEnding).toBe("CRLF");
  });

  it("unfolds long logical properties and preserves unknown fields", () => {
    const result = parseVCard(fixture("clean-3-0.vcf").replace("physical\nlines", "physical\n lines"));
    expect(result.contacts[0].note).toContain("physical lines");
    expect(result.contacts[0].properties.some((property) => property.name === "X-CUSTOM-FIELD")).toBe(true);
    const output = serializeVCards(result.contacts, { version: "3.0", preserveUnknown: true });
    expect(output).toContain("X-CUSTOM-FIELD:preserve me");
    expect(parseVCard(output).contacts).toHaveLength(1);
  });

  it("reports malformed boundaries without throwing", () => {
    const result = parseVCard(fixture("malformed-missing-end.vcf"));
    expect(result.contacts).toHaveLength(0);
    expect(result.issues.some((issue) => issue.code === "MISSING_END")).toBe(true);
  });

  it("keeps hostile values as data", () => {
    const result = parseVCard(fixture("hostile-values.vcf"));
    expect(result.contacts[0].formattedName).toContain("onerror");
    expect(result.contacts[0].emails[0]).toBe("=SUM(1+1)");
  });

  it("covers Unicode, mixed versions, quoted-printable, and unknown fields", () => {
    expect(parseVCard(fixture("unicode.vcf")).contacts[0].formattedName).toContain("太郎");
    expect(parseVCard(fixture("mixed-version.vcf")).contacts).toHaveLength(2);
    expect(parseVCard(fixture("quoted-printable.vcf")).contacts[0].formattedName).toContain("José");
    expect(parseVCard(fixture("unknown-extensions.vcf")).contacts[0].properties.map((property) => property.name)).toContain("X-CUSTOM-FIELD");
  });
});
