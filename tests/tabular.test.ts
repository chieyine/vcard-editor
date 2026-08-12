import { describe, expect, it } from "vitest";
import { contactsToRows, parseCsv, parseSpreadsheet, rowsToContacts, rowsToCsv, rowsToXlsx, suggestMapping } from "../lib/tabular";

describe("tabular conversion", () => {
  it("maps common spreadsheet synonyms into contacts", () => {
    const table = parseCsv('Given Name,Family Name,Mobile Phone,E-mail Address\nAda,Okafor,+234 801 234 5678,ada@example.com\n');
    const result = rowsToContacts(table.rows, suggestMapping(table.headers));
    expect(result.contacts[0]).toMatchObject({ firstName: "Ada", lastName: "Okafor", formattedName: "Ada Okafor" });
    expect(result.contacts[0].phones).toEqual(["+234 801 234 5678"]);
  });

  it("auto-detects pipe-delimited exports", () => {
    const result = parseCsv("First Name|Last Name|Phone\nAda|Okafor|+234 801 234 5678\n");
    expect(result.delimiter).toBe("|");
    expect(result.rows[0]).toMatchObject({ "First Name": "Ada", "Last Name": "Okafor" });
  });

  it("quotes cells and prefixes formula-like values", () => {
    const csv = rowsToCsv([{ Name: "Ada, Okafor", Value: "=SUM(1+1)" }]);
    expect(csv).toContain('"Ada, Okafor"');
    expect(csv).toContain("'=SUM(1+1)");
  });

  it("round-trips a generated workbook", async () => {
    const workbook = rowsToXlsx([{ "First name": "Ada", Phone: "+234 801 234 5678" }]);
    const result = await parseSpreadsheet(workbook);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]["First name"]).toBe("Ada");
  });

  it("protects formula-like values in workbook exports", async () => {
    const parsed = await parseSpreadsheet(rowsToXlsx([{ Note: "=HYPERLINK(\"https://example.test\")" }]));
    expect(parsed.rows[0].Note).toBe("'=HYPERLINK(\"https://example.test\")");
  });

  it("exports canonical contact columns", () => {
    const result = parseCsv("First name,Last name,Email\nAda,Okafor,ada@example.com\n");
    const contacts = rowsToContacts(result.rows, suggestMapping(result.headers)).contacts;
    expect(contactsToRows(contacts)[0]).toMatchObject({ "First name": "Ada", Email: "ada@example.com" });
  });
});
