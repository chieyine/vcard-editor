import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseVCard, serializeVCards } from "../lib/vcard";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const corpus = ["clean-2-1.vcf", "clean-3-0.vcf", "multi-duplicate.vcf", "malformed-missing-end.vcf", "hostile-values.vcf"];
const profiles = [
  { name: "Google Contacts", version: "3.0" as const },
  { name: "Apple Contacts", version: "3.0" as const },
  { name: "Outlook", version: "3.0" as const },
  { name: "Android Contacts", version: "3.0" as const },
];

describe("compatibility corpus", () => {
  it("parses every synthetic fixture without an uncaught exception", () => {
    corpus.forEach((name) => expect(() => parseVCard(fixture(name))).not.toThrow());
  });

  profiles.forEach((profile) => it(`reparses normalized output for ${profile.name}`, () => {
    const parsed = parseVCard(fixture("clean-3-0.vcf"));
    const output = serializeVCards(parsed.contacts, { version: profile.version, preserveUnknown: true });
    const roundTrip = parseVCard(output);
    expect(roundTrip.contacts).toHaveLength(parsed.contacts.length);
    expect(roundTrip.contacts[0].formattedName).toBe(parsed.contacts[0].formattedName);
  }));
});
