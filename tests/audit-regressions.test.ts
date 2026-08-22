import { describe, expect, it } from "vitest";
import initSqlJs from "sql.js/dist/sql-asm-memory-growth.js";
import { removeCountryCode } from "../lib/contact-tools";
import { createUniqueFileNamer } from "../lib/filenames";
import { sqliteToContacts } from "../lib/sqlite";
import { contactsToLdif, ldifToContacts } from "../lib/standards";
import { decodeVCardBytes, parseVCard } from "../lib/vcard";

describe("audit regressions", () => {
  it("attaches child rows by the contact id, not row position", async () => {
    const SQL = await initSqlJs();
    const database = new SQL.Database();
    database.run("CREATE TABLE contacts (id INTEGER PRIMARY KEY, uid TEXT, full_name TEXT NOT NULL, first_name TEXT, last_name TEXT, nickname TEXT, organisation TEXT, department TEXT, title TEXT, role TEXT, website TEXT, birthday TEXT, address TEXT, note TEXT, vcard_version TEXT)");
    database.run("CREATE TABLE phones (contact_id INTEGER NOT NULL REFERENCES contacts(id), value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)");
    database.run("CREATE TABLE emails (contact_id INTEGER NOT NULL REFERENCES contacts(id), value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)");
    database.run("CREATE TABLE categories (contact_id INTEGER NOT NULL REFERENCES contacts(id), value TEXT NOT NULL, position INTEGER NOT NULL)");
    database.run("INSERT INTO contacts (id, full_name) VALUES (1, 'Ada Okafor'), (3, 'Kojo Mensah')");
    database.run("INSERT INTO phones (contact_id, value, type, position) VALUES (3, '+233201234567', 'CELL', 0)");
    const exported = database.export();
    const buffer = exported.buffer.slice(exported.byteOffset, exported.byteOffset + exported.byteLength) as ArrayBuffer;
    database.close();
    const result = await sqliteToContacts(buffer);
    expect(result.contacts.map((contact) => contact.formattedName)).toEqual(["Ada Okafor", "Kojo Mensah"]);
    expect(result.contacts[0].phones).toEqual([]);
    expect(result.contacts[1].phones).toEqual(["+233201234567"]);
  }, 30000);

  it("leaves phone values unchanged when no country code is provided", () => {
    const contacts = parseVCard("BEGIN:VCARD\nVERSION:3.0\nFN:Ada\nTEL:+2348012345678\nTEL:0801 234 5678\nEND:VCARD").contacts;
    const untouched = removeCountryCode(contacts, "");
    expect(untouched[0].phones).toEqual(["+2348012345678", "0801 234 5678"]);
    const stripped = removeCountryCode(contacts, "+234");
    expect(stripped[0].phones[0]).toBe("08012345678");
    expect(stripped[0].phones[1]).toBe("0801 234 5678");
  });

  it("keeps an escaped backslash followed by n as literal text", () => {
    const escapedBackslash = parseVCard("BEGIN:VCARD\r\nVERSION:3.0\r\nFN:A\\\\nB\r\nEND:VCARD");
    expect(escapedBackslash.contacts[0].formattedName).toBe("A\\nB");
    const newline = parseVCard("BEGIN:VCARD\r\nVERSION:3.0\r\nNOTE:one\\ntwo\r\nEND:VCARD");
    expect(newline.contacts[0].note).toBe("one\ntwo");
    const roundTrip = parseVCard("BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Path\\\\to\\\\file\r\nEND:VCARD");
    expect(roundTrip.contacts[0].formattedName).toBe("Path\\to\\file");
  });

  it("emits RFC 2849 LDIF with folded lines and base64 for unsafe values", () => {
    const contacts = parseVCard("BEGIN:VCARD\r\nVERSION:3.0\r\nFN:José García\r\nN:García;José;;;\r\nTEL:+123456\r\nEMAIL:jose@example.test\r\nNOTE:Lòng description with a very long value that definitely needs folding because it exceeds the seventy-eight column limit imposed by RFC 2849\r\nEND:VCARD").contacts;
    const ldif = contactsToLdif(contacts);
    ldif.split("\n").forEach((line) => expect(line.length, line).toBeLessThanOrEqual(78));
    expect(ldif).toContain("cn:: ");
    expect(ldif).not.toContain("cn: José");
    const parsed = ldifToContacts(ldif);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].formattedName).toBe("José García");
    expect(parsed[0].note).toBe(contacts[0].note);
    expect(parsed[0].phones).toEqual(["+123456"]);
  });

  it("decodes legacy Windows-1252 exports instead of corrupting accents", () => {
    const bytes = new Uint8Array([0x4a, 0x6f, 0x73, 0xe9, 0x20, 0x64, 0x69, 0x76, 0x69, 0xf1, 0x61]);
    const decoded = decodeVCardBytes(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    expect(decoded.encoding).toBe("Windows-1252");
    expect(decoded.text).toBe("José diviña");
    const validUtf8 = new TextEncoder().encode("BEGIN:VCARD\nVERSION:3.0\nFN:José\nEND:VCARD");
    const utf8 = decodeVCardBytes(validUtf8.buffer.slice(validUtf8.byteOffset, validUtf8.byteOffset + validUtf8.byteLength) as ArrayBuffer);
    expect(utf8.encoding).toBe("UTF-8");
    expect(utf8.text).toContain("José");
  });

  it("uniquifies archive file names for identical stems", () => {
    const nameFile = createUniqueFileNamer(".vcf");
    const names = ["work team", "work/team", "work", ""].map(nameFile);
    expect(new Set(names).size).toBe(names.length);
    expect(names[0]).toBe("work-team.vcf");
    expect(names[1]).toBe("work-team-2.vcf");
    expect(names[3]).toBe("file.vcf");
  });
});
