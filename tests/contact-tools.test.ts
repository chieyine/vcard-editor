import { describe, expect, it } from "vitest";
import { cleanContacts, findDuplicateGroups, mergeContactGroup, normalizePhone, repairVCardText, validateContacts } from "../lib/contact-tools";
import { parseVCard } from "../lib/vcard";

const cards = parseVCard(`BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL:+234 801 234 5678\nEMAIL:ADA@EXAMPLE.COM\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL:+2348012345678\nEMAIL:ada@example.com\nNOTE:Keep this note\nEND:VCARD`).contacts;

describe("contact operations", () => {
  it("normalizes local phone numbers with an explicit country code", () => {
    expect(normalizePhone("0801 234 5678", "+234")).toBe("+2348012345678");
  });

  it("blocks duplicate matching with exact indexes", () => {
    const groups = findDuplicateGroups(cards);
    expect(groups).toHaveLength(1);
    expect(groups[0].confidence).toBe("high");
  });

  it("merges fields without duplicating phones or email addresses", () => {
    const merged = mergeContactGroup(cards, cards.map((card) => card.id));
    expect(merged).toHaveLength(1);
    expect(merged[0].emails).toHaveLength(1);
    expect(merged[0].note).toBe("Keep this note");
  });

  it("cleans email case and removes photos", () => {
    const result = cleanContacts([{ ...cards[0], photo: "data:image/jpeg;base64,abc" }], { trimWhitespace: true, normalizeEmails: true, normalizePhones: false, removePhotos: true, removeEmpty: false, countryCode: "+234" });
    expect(result.contacts[0].emails[0]).toBe("ada@example.com");
    expect(result.contacts[0].photo).toBe("");
  });

  it("repairs an unfinished final card", () => {
    const result = repairVCardText("BEGIN:VCARD\nVERSION:3.0\nFN:Unfinished");
    expect(result.output).toContain("END:VCARD");
    expect(result.parsed.contacts).toHaveLength(1);
  });

  it("reports invalid email values", () => {
    const contact = { ...cards[0], emails: ["not-an-email"] };
    expect(validateContacts([contact]).some((issue) => issue.code === "INVALID_EMAIL")).toBe(true);
  });
});
