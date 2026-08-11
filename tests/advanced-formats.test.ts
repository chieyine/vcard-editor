import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { contactsToPdf } from "../lib/pdf";
import { findFuzzyMatches } from "../lib/fuzzy";
import { contactsToSqlite, sqliteToContacts } from "../lib/sqlite";
import { parseSpreadsheet, rowsToXlsx } from "../lib/tabular";
import { parseVCard, serializeVCards, type Contact } from "../lib/vcard";

const contacts = parseVCard("BEGIN:VCARD\r\nVERSION:3.0\r\nN:Okafor;Ada;;;\r\nFN:Ada Okafor\r\nTEL:+2348012345678\r\nEMAIL:ada@example.test\r\nEND:VCARD\r\n").contacts;

describe("real binary expansion formats", () => {
  it("creates and reads a standards-shaped xlsx workbook", async () => {
    const workbook = rowsToXlsx([{ Name: "Ada Okafor", Phone: "+2348012345678" }]);
    const result = await parseSpreadsheet(workbook);
    expect(result.sheetName).toBe("Contacts");
    expect(result.rows[0]).toEqual({ Name: "Ada Okafor", Phone: "+2348012345678" });
  });

  it("round-trips contacts through an actual SQLite database", async () => {
    const database = await contactsToSqlite(contacts);
    expect(new TextDecoder().decode(database.slice(0, 16))).toBe("SQLite format 3\u0000");
    const buffer = database.buffer.slice(database.byteOffset, database.byteOffset + database.byteLength) as ArrayBuffer;
    const result = await sqliteToContacts(buffer);
    expect(result.contacts[0].formattedName).toBe("Ada Okafor");
    expect(result.contacts[0].phones).toEqual(["+2348012345678"]);
  }, 30000);

  it("creates a valid PDF document", async () => {
    const pdf = await contactsToPdf(contacts);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(500);
  });

  it("embeds international fonts in PDF exports", async () => {
    const scripts = ["latin-ext", "cyrillic-ext", "greek-ext", "devanagari"];
    const load = (weight: 400 | 700) => scripts.map((script) => {
      const bytes = readFileSync(path.join(process.cwd(), `public/fonts/noto-sans-${script}-${weight}.woff2`));
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    });
    const international: Contact = { ...contacts[0], formattedName: "Željko Мария Αθήνα आरव", organisation: "Équipe Δ" };
    const pdf = await contactsToPdf([international], { regular: load(400), bold: load(700) });
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
    expect(pdf.byteLength).toBeGreaterThan(5000);
  }, 15000);
});

describe("bounded fuzzy matching", () => {
  it("finds similar names within a blocking key", () => {
    const variant: Contact = { ...contacts[0], id: "two", formattedName: "Ada Okafo", phones: [], emails: ["ada.okafor@example.test"] };
    const result = findFuzzyMatches([contacts[0], variant], 0.6);
    expect(result.matches).toHaveLength(1);
    expect(result.comparisons).toBeLessThanOrEqual(2);
  });
});

describe("UTF-8 serialization", () => {
  it("folds long Unicode lines on octet boundaries and reparses them", () => {
    const source: Contact = { ...contacts[0], note: "界".repeat(80) };
    const output = serializeVCards([source], "4.0");
    output.split("\r\n").forEach((line) => expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75));
    expect(parseVCard(output).contacts[0].note).toBe(source.note);
  });
});
