import { describe, expect, it } from "vitest";
import { convertStandards } from "../lib/standards";

const vcf = "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Ada;;;\nFN:Ada Doe\nTEL;TYPE=CELL:+123456\nEMAIL:ada@example.test\nORG:Example\nEND:VCARD";

describe("standards expansion formats", () => {
  it("round-trips readable JSON contact data", () => {
    const json = convertStandards(vcf, "from-vcard", "json");
    const output = convertStandards(json, "to-vcard", "json");
    expect(output).toContain("FN:Ada Doe");
    expect(output).toContain("ada@example.test");
  });

  it("round-trips JSContact and jCard", () => {
    for (const format of ["jscontact", "jcard"] as const) {
      const json = convertStandards(vcf, "from-vcard", format);
      const output = convertStandards(json, "to-vcard", format);
      expect(output).toContain("FN:Ada Doe");
      expect(output).toContain("ada@example.test");
    }
  });

  it("round-trips xCard and LDIF", () => {
    for (const format of ["xcard", "ldif"] as const) {
      const text = convertStandards(vcf, "from-vcard", format);
      const output = convertStandards(text, "to-vcard", format);
      expect(output).toContain("FN:Ada Doe");
      expect(output).toContain("+123456");
    }
  });
});
