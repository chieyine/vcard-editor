import { parseXml, childElements, type Document, type Element } from "./xml";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { uniqueHeaders } from "./tabular-headers";

export type SpreadsheetRow = Record<string, string>;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
  for (const character of match[1].toUpperCase())
    column = column * 26 + character.charCodeAt(0) - 64;
  return {
    row: Math.max(0, Number(match[2]) - 1),
    column: Math.max(0, column - 1),
  };
}

function workbookFiles(rows: SpreadsheetRow[]) {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const allRows = [
    headers,
    ...rows.map((row) => headers.map((header) => String(row[header] ?? ""))),
  ];
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
          return `<c r="${reference}" t="inlineStr" s="1"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");
  const lastColumn = columnName(Math.max(0, headers.length - 1));
  const dimension = headers.length
    ? `A1:${lastColumn}${Math.max(1, allRows.length)}`
    : "A1";
  const autoFilter = headers.length
    ? `<autoFilter ref="A1:${lastColumn}${Math.max(1, allRows.length)}"/>`
    : "";
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
  const files = Object.fromEntries(
    Object.entries(workbookFiles(rows)).map(([name, content]) => [
      name,
      strToU8(content),
    ]),
  );
  const archive = zipSync(files, { level: 6 });
  return archive.buffer.slice(
    archive.byteOffset,
    archive.byteOffset + archive.byteLength,
  ) as ArrayBuffer;
}

const elements = (node: Document | Element, name: string) =>
  Array.from(node.getElementsByTagNameNS("*", name));
const content = (node: Element, name: string) =>
  elements(node, name)[0]?.textContent ?? "";
export type WorkbookSheet = { name: string; index: number; hidden: boolean };

export function readXlsx(buffer: ArrayBuffer, sheetIndex?: number) {
  if (buffer.byteLength > 25 * 1024 * 1024)
    throw new Error("Use a workbook smaller than 25 MB.");
  let expandedBytes = 0;
  let entries = 0;
  const files = unzipSync(new Uint8Array(buffer), {
    filter: (file) => {
      if (++entries > 2000)
        throw new Error("This workbook contains too many archive entries.");
      const needed =
        /^(\[Content_Types\]\.xml|xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml))$/.test(
          file.name,
        );
      if (!needed) return false;
      expandedBytes += file.originalSize;
      if (expandedBytes > 64 * 1024 * 1024)
        throw new Error(
          "This workbook expands beyond the 64 MB processing limit.",
        );
      return true;
    },
  });
  const xml = (path: string) => {
    if (!files[path]) throw new Error(`Missing workbook part: ${path}`);
    return parseXml(strFromU8(files[path]));
  };
  if (!files["[Content_Types].xml"])
    throw new Error("This is not a supported XLSX workbook.");
  const workbook = xml("xl/workbook.xml");
  const sheetElements = elements(workbook, "sheet");
  const sheets: WorkbookSheet[] = sheetElements.map((sheet, index) => ({
    name: sheet.getAttribute("name") || `Sheet ${index + 1}`,
    index,
    hidden: ["hidden", "veryHidden"].includes(
      sheet.getAttribute("state") ?? "",
    ),
  }));
  const selected =
    sheetIndex ?? sheets.find((sheet) => !sheet.hidden)?.index ?? 0;
  const sheet = sheetElements[selected];
  if (!sheet) throw new Error("Choose a worksheet from this workbook.");
  const relationshipId =
    sheet.getAttributeNS(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "id",
    ) ?? sheet.getAttribute("r:id");
  const relationship = elements(
    xml("xl/_rels/workbook.xml.rels"),
    "Relationship",
  ).find((item) => item.getAttribute("Id") === relationshipId);
  if (!relationship || relationship.getAttribute("TargetMode") === "External")
    throw new Error("External or missing worksheets are unsupported.");
  const target = relationship.getAttribute("Target") ?? "";
  const path = new URL(
    target,
    "https://workbook.invalid/xl/workbook.xml",
  ).pathname.slice(1);
  if (!/^xl\/worksheets\/[^/]+\.xml$/.test(path))
    throw new Error("Unsupported worksheet path.");
  const source = xml(path);
  const warnings = new Set<string>();
  if (sheets[selected].hidden) warnings.add("You selected a hidden sheet.");
  if (elements(source, "mergeCell").length)
    warnings.add(
      "Merged cells keep only their top-left value. Review the mapped output.",
    );
  if (elements(source, "f").length)
    warnings.add(
      "Formulas are not evaluated. Only saved cached values are imported.",
    );
  const strings = files["xl/sharedStrings.xml"]
    ? elements(xml("xl/sharedStrings.xml"), "si").map((item) =>
        elements(item, "t")
          .map((part) => part.textContent ?? "")
          .join(""),
      )
    : [];
  const styles = files["xl/styles.xml"] ? xml("xl/styles.xml") : null;
  const formats = new Map(
    styles
      ? elements(styles, "numFmt").map((item) => [
          Number(item.getAttribute("numFmtId")),
          item.getAttribute("formatCode") ?? "",
        ])
      : [],
  );
  const styleIds = styles
    ? childElements(elements(styles, "cellXfs")[0]).map((item) =>
        Number(item.getAttribute("numFmtId")),
      )
    : [];
  const date1904 =
    elements(workbook, "workbookPr")[0]?.getAttribute("date1904") === "1";
  function displayed(raw: string, formatId: number) {
    if (!raw || !Number.isFinite(Number(raw))) return raw;
    const format = formats.get(formatId) ?? "";
    if (/^0{2,128}$/.test(format) && /^\d+$/.test(raw))
      return raw.padStart(format.length, "0");
    if (
      (formatId >= 14 && formatId <= 17) ||
      /^yyyy[-/]mm[-/]dd$/i.test(format)
    ) {
      const serial = Number(raw);
      if (serial < 0 || serial > 2958465) {
        warnings.add("An out-of-range date was kept as its numeric value.");
        return raw;
      }
      if (!date1904 && Math.floor(serial) === 60) {
        warnings.add(
          "Excel’s fictitious 1900-02-29 date is kept as serial 60. Review that cell.",
        );
        return raw;
      }
      const adjusted = date1904 ? serial : serial >= 60 ? serial - 1 : serial;
      return new Date(
        (date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31)) +
          adjusted * 86400000,
      )
        .toISOString()
        .slice(0, 10);
    }
    if (formatId !== 0 && formatId !== 49)
      warnings.add(
        "Some numeric/date display formats are unsupported and remain raw values. Format phone columns as Text in the source to preserve their intended display.",
      );
    return raw;
  }
  const grid: string[][] = [];
  const cells = elements(source, "c");
  if (cells.length > 1000000)
    throw new Error("The worksheet exceeds one million populated cells.");
  for (const cell of cells) {
    const reference = cell.getAttribute("r") ?? "";
    if (!/^[A-Z]+[1-9]\d*$/i.test(reference))
      throw new Error("A cell has no valid position.");
    const position = cellPosition(reference);
    if (position.row >= 50001 || position.column >= 256)
      throw new Error("Use at most 50,000 data rows and 256 columns.");
    const type = cell.getAttribute("t") ?? "n";
    const raw = content(cell, "v");
    let value =
      type === "inlineStr"
        ? elements(cell, "t")
            .map((part) => part.textContent ?? "")
            .join("")
        : type === "s"
          ? (strings[Number(raw)] ?? "")
          : type === "b"
            ? raw === "1"
              ? "TRUE"
              : "FALSE"
            : type === "n"
              ? displayed(
                  raw,
                  styleIds[Number(cell.getAttribute("s") ?? 0)] ?? 0,
                )
              : raw;
    if (type === "e") {
      warnings.add(
        "Spreadsheet error cells were kept as error text for review.",
      );
      value = raw;
    }
    grid[position.row] ??= [];
    grid[position.row][position.column] = value;
  }
  const notes = [...warnings];
  const headers = uniqueHeaders(grid[0] ?? [], notes);
  const rows = grid
    .slice(1)
    .filter((values) => values?.some((value) => value?.trim()))
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values?.[index] ?? ""]),
      ),
    );
  if (!headers.length) notes.push("The selected worksheet has no header row.");
  return {
    headers,
    rows,
    sheetName: sheets[selected].name,
    sheetIndex: selected,
    sheets,
    warnings: notes,
  };
}
