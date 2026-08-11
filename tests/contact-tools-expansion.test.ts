import { describe, expect, it } from "vitest";
import { contactsToHtml, contactsToText, contactsToTsv, fieldFrequency, filterContacts, removeDuplicateFields, sortContacts } from "../lib/contact-tools";
import { parseVCard, serializeVCards } from "../lib/vcard";

const contacts = parseVCard(`BEGIN:VCARD\nVERSION:3.0\nN:Doe;Ada;;;\nFN:Ada Doe\nTEL:123\nTEL:123\nEMAIL:ADA@EXAMPLE.TEST\nEMAIL:ada@example.test\nORG:Example\nURL:https://example.test\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nEMAIL:kojo@example.test\nEND:VCARD`).contacts;

describe("contact utility expansion", () => {
  it("filters and sorts without mutating input", () => {
    expect(filterContacts(contacts, "has-phone")).toHaveLength(1);
    expect(sortContacts(contacts, "name", "desc")[0].formattedName).toBe("Kojo Mensah");
  });

  it("removes repeated field values and reports frequency", () => {
    const cleaned = removeDuplicateFields(contacts);
    expect(cleaned[0].phones).toHaveLength(1);
    expect(cleaned[0].emails).toHaveLength(1);
    expect(fieldFrequency(contacts).find((row) => row.field === "EMAIL")?.count).toBe(2);
  });

  it("produces safe local text formats", () => {
    expect(contactsToText(contacts)).toContain("Ada Doe");
    expect(contactsToHtml(contacts)).not.toContain("<script");
    expect(contactsToTsv(contacts).split("\r\n")[0]).toContain("Full Name");
  });

  it("serializes richer optional fields", () => {
    const output = serializeVCards([{ ...contacts[0], nickname: "Ada", department: "Design", birthday: "1990-01-01", url: "https://example.test/ada", address: "Street;City" }]);
    expect(output).toContain("NICKNAME:Ada");
    expect(output).toContain("BDAY:1990-01-01");
    expect(parseVCard(output).contacts[0].birthday).toBe("1990-01-01");
  });
});
