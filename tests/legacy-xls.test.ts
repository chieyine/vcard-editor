import { describe, expect, it } from "vitest";
import { writeCfb } from "../node_modules/hucre/dist/xlsx/crypto/cfb.mjs";
import { parseSpreadsheet } from "../lib/tabular";

const u16 = (value: number) => [value & 0xff, (value >> 8) & 0xff];
const u32 = (value: number) => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff];
const record = (id: number, data: number[]) => [...u16(id), ...u16(data.length), ...data];
const shortString = (value: string) => [value.length, 0, ...Array.from(value, (character) => character.charCodeAt(0))];
const bof = (type: number) => record(0x0809, [...u16(0x0600), ...u16(type), ...u16(0), ...u16(0), ...u32(0), ...u32(0)]);
const eof = () => record(0x000a, []);

function join(parts: number[][]) {
  const output = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { output.set(part, offset); offset += part.length; });
  return output;
}

function sharedStrings(values: string[]) {
  return record(0x00fc, [...u32(values.length), ...u32(values.length), ...values.flatMap((value) => [...u16(value.length), 0, ...Array.from(value, (character) => character.charCodeAt(0))])]);
}

function legacyContactWorkbook() {
  const values = ["First name", "Phone", "Ada", "+2348012345678"];
  const sheet = join([
    bof(0x0010),
    record(0x00fd, [...u16(0), ...u16(0), ...u16(0), ...u32(0)]),
    record(0x00fd, [...u16(0), ...u16(1), ...u16(0), ...u32(1)]),
    record(0x00fd, [...u16(1), ...u16(0), ...u16(0), ...u32(2)]),
    record(0x00fd, [...u16(1), ...u16(1), ...u16(0), ...u32(3)]),
    eof(),
  ]);
  const globals = (sheetOffset: number) => join([
    bof(0x0005),
    sharedStrings(values),
    record(0x0085, [...u32(sheetOffset), 0, 0, ...shortString("Contacts")]),
    eof(),
  ]);
  const workbookGlobals = globals(globals(0).length);
  return writeCfb([{ name: "Workbook", data: join([Array.from(workbookGlobals), Array.from(sheet)]) }]);
}

describe("legacy Excel import", () => {
  it("reads BIFF8 XLS contacts as data-only values", async () => {
    const bytes = legacyContactWorkbook();
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const result = await parseSpreadsheet(buffer);
    expect(result.sheetName).toBe("Contacts");
    expect(result.rows[0]).toEqual({ "First name": "Ada", Phone: "+2348012345678" });
    expect(result.warnings.join(" ")).toMatch(/data only/i);
  });
});
