import { assertTextBudget } from "./file-guard";
import type { Contact } from "./vcard";
import { readXlsx, writeXlsx } from "./xlsx";
import { uniqueHeaders } from "./tabular-headers";

export type ContactColumn =
  | "firstName"
  | "lastName"
  | "formattedName"
  | "nickname"
  | "phone"
  | "email"
  | "organisation"
  | "department"
  | "title"
  | "role"
  | "url"
  | "birthday"
  | "address"
  | "note"
  | "uid"
  | "categories";
export type TabularRow = Record<string, string>;

export const CONTACT_COLUMNS: { key: ContactColumn; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "formattedName", label: "Full name" },
  { key: "nickname", label: "Nickname" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "organisation", label: "Organization" },
  { key: "department", label: "Department" },
  { key: "title", label: "Job title" },
  { key: "role", label: "Role" },
  { key: "url", label: "Website" },
  { key: "birthday", label: "Birthday" },
  { key: "address", label: "Address" },
  { key: "note", label: "Note" },
  { key: "uid", label: "UID" },
  { key: "categories", label: "Categories" },
];

function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .replace(/[_.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function suggestMapping(headers: string[]) {
  const mapping: Record<string, ContactColumn | "ignore"> = {};
  headers.forEach((header) => {
    const value = normalizeHeader(header);
    if (/(phone|mobile|telephone|e ?mail).*\b(type|label)\b/.test(value))
      mapping[header] = "ignore";
    else if (/^(first|given) name$|^firstname$|^givenname$/.test(value))
      mapping[header] = "firstName";
    else if (/^(last|family|sur) name$|^lastname$|^surname$/.test(value))
      mapping[header] = "lastName";
    else if (/^(full|display|formatted) name$|^name$|^fn$/.test(value))
      mapping[header] = "formattedName";
    else if (/phone|mobile|telephone|tel|cell/.test(value))
      mapping[header] = "phone";
    else if (/e ?mail|email address/.test(value)) mapping[header] = "email";
    else if (/company|organisation|organization|org/.test(value))
      mapping[header] = "organisation";
    else if (/department|team|division/.test(value))
      mapping[header] = "department";
    else if (/job|title|position/.test(value)) mapping[header] = "title";
    else if (/^role$/.test(value)) mapping[header] = "role";
    else if (/website|url|web site/.test(value)) mapping[header] = "url";
    else if (/birthday|birth date|dob/.test(value))
      mapping[header] = "birthday";
    else if (/address|street/.test(value)) mapping[header] = "address";
    else if (/nickname|nick name/.test(value)) mapping[header] = "nickname";
    else if (/note|comment|memo/.test(value)) mapping[header] = "note";
    else if (/^uid$|contact id|identifier/.test(value)) mapping[header] = "uid";
    else if (/category|categories|group|label/.test(value))
      mapping[header] = "categories";
    else mapping[header] = "ignore";
  });
  return mapping;
}

export function contactsToRows(contacts: Contact[]): TabularRow[] {
  return contacts.map((contact) => {
    const row: TabularRow = {
      "First name": contact.firstName,
      "Last name": contact.lastName,
      "Full name": contact.formattedName,
      Nickname: contact.nickname ?? "",
      Phone: contact.phones[0] ?? "",
      Email: contact.emails[0] ?? "",
      Organization: contact.organisation,
      Department: contact.department ?? "",
      "Job title": contact.title,
      Role: contact.role ?? "",
      Website: contact.url ?? "",
      Birthday: contact.birthday ?? "",
      Address: contact.address ?? "",
      Note: contact.note,
      UID: contact.uid,
      Categories: contact.categories.join(", "),
    };
    contact.phones.slice(1).forEach((phone, index) => {
      row[`Phone ${index + 2}`] = phone;
    });
    contact.emails.slice(1).forEach((email, index) => {
      row[`Email ${index + 2}`] = email;
    });
    return row;
  });
}

export function csvSafeValue(value: string, safeMode = true) {
  const normalized = String(value ?? "").replace(
    // eslint-disable-next-line no-control-regex -- Deliberate handling of unsafe control characters.
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,
    "",
  );
  // Prefix formula-like cells so opening the CSV in a spreadsheet cannot execute them.
  return safeMode && /^\s*[=+\-@]/.test(normalized)
    ? `'${normalized}`
    : normalized;
}
function csvSafe(value: string, safeMode = true) {
  const safe = csvSafeValue(value, safeMode);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function spreadsheetSafe(value: string) {
  const normalized = String(value ?? "").replace(
    // eslint-disable-next-line no-control-regex -- Deliberate handling of unsafe control characters.
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,
    "",
  );
  // Keep international phone numbers usable while visibly neutralising values
  // that another spreadsheet program could later reinterpret as formulas.
  const internationalPhone = /^\+[\d\s().-]+$/.test(normalized);
  return !internationalPhone && /^\s*[=+\-@]/.test(normalized)
    ? `'${normalized}`
    : normalized;
}

export function rowsToCsv(rows: TabularRow[], safeMode = true) {
  if (!rows.length) return "";
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return (
    [
      headers.map((header) => csvSafe(header, safeMode)).join(","),
      ...rows.map((row) =>
        headers.map((header) => csvSafe(row[header] ?? "", safeMode)).join(","),
      ),
    ].join("\r\n") + "\r\n"
  );
}

export function parseCsv(text: string): {
  headers: string[];
  rows: TabularRow[];
  delimiter: string;
  warnings: string[];
} {
  assertTextBudget(text);
  const clean = text.replace(/^\uFEFF/, "");
  const candidates = [",", "\t", ";", "|"];
  const counts = new Map(candidates.map((candidate) => [candidate, 0]));
  let inQuotes = false;
  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index];
    if (character === '"') {
      if (inQuotes && clean[index + 1] === '"') index += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (character === "\r" || character === "\n") break;
      if (counts.has(character))
        counts.set(character, counts.get(character)! + 1);
    }
  }
  const delimiter = candidates.sort(
    (a, b) => counts.get(b)! - counts.get(a)!,
  )[0];
  const records: string[][] = [];
  let record: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < clean.length; index += 1) {
    const character = clean[index];
    if (character === '"') {
      if (quoted && clean[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      record.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && clean[index + 1] === "\n") index += 1;
      record.push(cell);
      records.push(record);
      if (records.length > 50001 || record.length > 256)
        throw new Error("Use at most 50,000 rows and 256 columns.");
      record = [];
      cell = "";
    } else cell += character;
  }
  if (cell || record.length) {
    record.push(cell);
    records.push(record);
  }
  if (records.length > 50001 || records.some((values) => values.length > 256))
    throw new Error("Use at most 50,000 rows and 256 columns.");
  const warnings: string[] = [];
  if (quoted)
    warnings.push(
      "A quoted field was not closed. Review the rows before exporting.",
    );
  const headers = uniqueHeaders(records.shift() ?? [], warnings);
  const rows = records
    .filter((values) => values.some((value) => value.trim()))
    .map((values, rowIndex) => {
      if (values.length > headers.length)
        warnings.push(
          `Row ${rowIndex + 2} has extra columns; the extra values were ignored.`,
        );
      return headers.reduce<TabularRow>((row, header, index) => {
        row[header] = values[index] ?? "";
        return row;
      }, {});
    });
  if (!headers.length) warnings.push("The CSV has no header row.");
  return { headers, rows, delimiter, warnings };
}

function spreadsheetValue(value: string | number | boolean | Date | null) {
  if (value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function looksLikeLegacyXls(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 8));
  return [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every(
    (value, index) => bytes[index] === value,
  );
}

export async function parseSpreadsheet(
  buffer: ArrayBuffer,
  sheetIndex?: number,
) {
  if (!looksLikeLegacyXls(buffer)) return readXlsx(buffer, sheetIndex);
  if (buffer.byteLength > 5 * 1024 * 1024)
    throw new Error(
      "Legacy XLS imports are limited to 5 MB. Save a larger file as XLSX first.",
    );

  // BIFF8 parsing is loaded only for an actual legacy workbook, keeping the
  // normal XLSX route small. The reader returns cached/displayed cell values;
  // formulas and embedded macros are never executed.
  const { readXls } = await import("hucre");
  const workbook = await readXls(buffer);
  const selected =
    sheetIndex ??
    Math.max(
      0,
      workbook.sheets.findIndex(
        (candidate) => !candidate.hidden && !candidate.veryHidden,
      ),
    );
  const sheet = workbook.sheets[selected];
  if (!sheet)
    throw new Error("This Excel workbook does not contain a readable sheet.");
  const [headerRow = [], ...dataRows] = sheet.rows;
  if (sheet.rows.length > 50001 || sheet.rows.some((row) => row.length > 256))
    throw new Error("Use at most 50,000 rows and 256 columns.");
  const warnings: string[] = [];
  const headers = uniqueHeaders(headerRow.map(spreadsheetValue), warnings);
  if (!headers.length) warnings.push("The selected sheet has no header row.");
  if (
    workbook.sheets.some(
      (candidate) => candidate.hidden || candidate.veryHidden,
    )
  )
    warnings.push("This workbook contains hidden sheets. Only the selected sheet is imported.");
  if (sheet.merges?.length)
    warnings.push(
      "Merged cells were read as displayed values; only the top-left value is retained.",
    );
  warnings.push(
    "Legacy XLS was imported as data only. Formulas and macros were not evaluated.",
  );
  const rows = dataRows
    .filter((values) => values.some((value) => spreadsheetValue(value).trim()))
    .map((values) =>
      headers.reduce<TabularRow>((row, header, index) => {
        row[header] = spreadsheetValue(values[index] ?? null);
        return row;
      }, {}),
    );
  return {
    headers,
    rows,
    warnings,
    sheetName: sheet.name,
    sheetIndex: selected,
    sheets: workbook.sheets.map((item, index) => ({
      name: item.name,
      index,
      hidden: Boolean(item.hidden || item.veryHidden),
    })),
  };
}

export function rowsToXlsx(rows: TabularRow[]) {
  return writeXlsx(
    rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          spreadsheetSafe(value),
        ]),
      ),
    ),
  );
}

function emptyContact(index: number): Contact {
  return {
    id: `imported-${index + 1}`,
    version: "3.0",
    firstName: "",
    lastName: "",
    formattedName: "",
    phones: [],
    emails: [],
    organisation: "",
    title: "",
    note: "",
    uid: "",
    categories: [],
    photo: "",
    rawProperties: [],
    properties: [],
    issues: [],
  };
}

export function mappingConflicts(
  mapping: Record<string, ContactColumn | "ignore">,
) {
  const values = Object.values(mapping).filter(
    (field) => !["ignore", "phone", "email", "categories"].includes(field),
  );
  return [
    ...new Set(
      values.filter((field, index) => values.indexOf(field) !== index),
    ),
  ];
}

export function rowsToContacts(
  rows: TabularRow[],
  mapping: Record<string, ContactColumn | "ignore">,
): { contacts: Contact[]; warnings: string[] } {
  const conflicts = mappingConflicts(mapping);
  if (conflicts.length)
    return {
      contacts: [],
      warnings: [`Map only one column to each of: ${conflicts.join(", ")}.`],
    };
  const warnings: string[] = [];
  const contacts = rows.map((row, rowIndex) => {
    const contact = emptyContact(rowIndex);
    Object.entries(mapping).forEach(([header, field]) => {
      const value = String(row[header] ?? "").trim();
      if (!value || field === "ignore") return;
      if (field === "phone") contact.phones.push(value);
      else if (field === "email") contact.emails.push(value);
      else if (field === "categories")
        contact.categories.push(
          ...value
            .split(/[,;|]/)
            .map((item) => item.trim())
            .filter(Boolean),
        );
      else contact[field] = value;
    });
    if (!contact.formattedName)
      contact.formattedName = [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(" ");
    if (
      !contact.formattedName &&
      !contact.phones.length &&
      !contact.emails.length
    )
      warnings.push(
        `Row ${rowIndex + 2} has no name, phone, or email and may be empty.`,
      );
    return contact;
  });
  return { contacts, warnings };
}
