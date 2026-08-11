import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export type SpreadsheetRow = Record<string, string>;

const XML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function decodeXml(value: string) {
  return value.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, entity: string) => XML_ENTITIES[entity] ?? "");
}

function attribute(source: string, name: string) {
  return source.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

function columnName(index: number) {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function cellPosition(reference: string) {
  const match = reference.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { row: 0, column: 0 };
  let column = 0;
  for (const character of match[1].toUpperCase()) column = column * 26 + character.charCodeAt(0) - 64;
  return { row: Math.max(0, Number(match[2]) - 1), column: Math.max(0, column - 1) };
}

function workbookFiles(rows: SpreadsheetRow[]) {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const allRows = [headers, ...rows.map((row) => headers.map((header) => String(row[header] ?? "")))];
  const sheetRows = allRows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      return `<c r="${reference}" t="inlineStr" s="1"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  const lastColumn = columnName(Math.max(0, headers.length - 1));
  const dimension = headers.length ? `A1:${lastColumn}${Math.max(1, allRows.length)}` : "A1";
  const autoFilter = headers.length ? `<autoFilter ref="A1:${lastColumn}${Math.max(1, allRows.length)}"/>` : "";
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dimension}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${headers.map((header, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.min(42, Math.max(12, header.length + 4))}" customWidth="1"/>`).join("")}</cols><sheetData>${sheetRows}</sheetData>${autoFilter}</worksheet>`;

  return {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    "docProps/core.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:creator>vCard Editor</dc:creator><dc:title>Contacts</dc:title></cp:coreProperties>`,
    "docProps/app.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>vCard Editor</Application></Properties>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Contacts" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="49" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`,
    "xl/worksheets/sheet1.xml": worksheet,
  };
}

export function writeXlsx(rows: SpreadsheetRow[]) {
  const files = Object.fromEntries(Object.entries(workbookFiles(rows)).map(([name, content]) => [name, strToU8(content)]));
  const archive = zipSync(files, { level: 6 });
  return archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer;
}

function readSharedStrings(files: Record<string, Uint8Array>) {
  const source = files["xl/sharedStrings.xml"] ? strFromU8(files["xl/sharedStrings.xml"]) : "";
  return [...source.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)].map((match) => [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((part) => decodeXml(part[1])).join(""));
}

function resolveSheet(files: Record<string, Uint8Array>) {
  const workbook = files["xl/workbook.xml"] ? strFromU8(files["xl/workbook.xml"]) : "";
  const relationships = files["xl/_rels/workbook.xml.rels"] ? strFromU8(files["xl/_rels/workbook.xml.rels"]) : "";
  const sheetTag = workbook.match(/<sheet\b[^>]*\/>/i)?.[0] ?? "";
  const name = decodeXml(attribute(sheetTag, "name")) || "Sheet 1";
  const relationshipId = attribute(sheetTag, "r:id");
  const relationship = [...relationships.matchAll(/<Relationship\b[^>]*\/>/gi)].find((match) => attribute(match[0], "Id") === relationshipId)?.[0] ?? "";
  const target = attribute(relationship, "Target").replace(/^\//, "");
  const path = target ? (target.startsWith("xl/") ? target : `xl/${target.replace(/^\.\//, "")}`) : "xl/worksheets/sheet1.xml";
  return { name, path };
}

export function readXlsx(buffer: ArrayBuffer) {
  const files = unzipSync(new Uint8Array(buffer));
  if (!files["[Content_Types].xml"] || !files["xl/workbook.xml"]) throw new Error("This is not a supported .xlsx workbook.");
  const sharedStrings = readSharedStrings(files);
  const sheet = resolveSheet(files);
  const source = files[sheet.path] ? strFromU8(files[sheet.path]) : "";
  if (!source) throw new Error("The first worksheet could not be read.");
  const warnings: string[] = [];
  if (/<mergeCells\b/i.test(source)) warnings.push("Merged cells were read by their top-left value; review the mapping.");
  if (/<f\b/i.test(source)) warnings.push("Formula cells were not evaluated; only cached displayed values were read.");
  const grid: string[][] = [];
  for (const match of source.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
    const reference = attribute(match[1], "r");
    const type = attribute(match[1], "t");
    const position = cellPosition(reference);
    const inline = match[2].match(/<is\b[^>]*>([\s\S]*?)<\/is>/i)?.[1] ?? "";
    const raw = inline ? [...inline.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/gi)].map((part) => decodeXml(part[1])).join("") : decodeXml(match[2].match(/<v\b[^>]*>([\s\S]*?)<\/v>/i)?.[1] ?? "");
    const value = type === "s" ? sharedStrings[Number(raw)] ?? "" : type === "b" ? (raw === "1" ? "TRUE" : "FALSE") : raw;
    grid[position.row] ??= [];
    grid[position.row][position.column] = value;
  }
  const headerValues = grid[0] ?? [];
  const headers = headerValues.map((value, index) => String(value).trim() || `Column ${index + 1}`);
  const rows = grid.slice(1).filter((values) => values?.some((value) => String(value ?? "").trim())).map((values) => headers.reduce<SpreadsheetRow>((row, header, index) => {
    row[header] = String(values?.[index] ?? "");
    return row;
  }, {}));
  if (!headers.length) warnings.push("The first worksheet has no header row.");
  return { headers, rows, sheetName: sheet.name, warnings };
}
