export type VCardVersion = "2.1" | "3.0" | "4.0" | "unknown";
export type KnownVCardVersion = Exclude<VCardVersion, "unknown">;
export type IssueSeverity = "warning" | "error";

export type ValidationIssue = {
  code: string;
  severity: IssueSeverity;
  message: string;
  line?: number;
  property?: string;
};

export type VCardProperty = {
  name: string;
  group?: string;
  params: Record<string, string[]>;
  value: string;
  rawValue: string;
  raw: string;
  line: number;
};

export type Contact = {
  id: string;
  version: VCardVersion;
  firstName: string;
  lastName: string;
  formattedName: string;
  phones: string[];
  emails: string[];
  phoneTypes?: string[];
  emailTypes?: string[];
  organisation: string;
  title: string;
  note: string;
  uid: string;
  categories: string[];
  photo: string;
  photoType?: string;
  /** Optional canonical fields retained for richer creator/editor workflows. */
  nickname?: string;
  department?: string;
  role?: string;
  url?: string;
  birthday?: string;
  address?: string;
  rawProperties: string[];
  properties: VCardProperty[];
  issues: ValidationIssue[];
};

export type ParseResult = {
  contacts: Contact[];
  warnings: string[];
  issues: ValidationIssue[];
  versions: Record<string, number>;
  lineEnding: "CRLF" | "LF" | "CR" | "mixed";
  encoding: "UTF-8" | "UTF-16LE" | "UTF-16BE" | "Windows-1252" | "unknown";
  totalLines: number;
};

export type SerializeOptions = {
  version?: KnownVCardVersion;
  lineEnding?: "CRLF" | "LF";
  preserveUnknown?: boolean;
  includePhotos?: boolean;
};

const KNOWN_PROPERTIES = new Set(["BEGIN", "END", "VERSION", "N", "FN", "TEL", "EMAIL", "ORG", "TITLE", "NOTE", "UID", "CATEGORIES", "PHOTO", "PRODID", "NICKNAME", "ROLE", "URL", "BDAY", "ADR"]);

function splitEscaped(value: string, delimiter: string) {
  const parts: string[] = [];
  let current = "";
  let escaped = false;
  for (const character of value) {
    if (escaped) { current += `\\${character}`; escaped = false; continue; }
    if (character === "\\") { escaped = true; continue; }
    if (character === delimiter) { parts.push(current); current = ""; continue; }
    current += character;
  }
  if (escaped) current += "\\";
  parts.push(current);
  return parts;
}

function unescapeValue(value: string) {
  return value.replace(/\\(\\|n|,|;)/gi, (_, character: string) => character.toLowerCase() === "n" ? "\n" : character);
}

function escapeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function decodeQuotedPrintable(value: string) {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "=" && /^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))) { bytes.push(Number.parseInt(value.slice(index + 1, index + 3), 16)); index += 2; }
    else bytes.push(value.charCodeAt(index));
  }
  try { return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes)); } catch { return value; }
}

function decodeParameterValue(value: string) {
  return value.replace(/\^n/gi, "\n").replace(/\^'/g, '"').replace(/\^\^/g, "^");
}

function decodeValue(value: string, params: Record<string, string[]>) {
  const encoding = params.ENCODING?.[0]?.toUpperCase();
  return unescapeValue(encoding === "QUOTED-PRINTABLE" ? decodeQuotedPrintable(value) : value);
}

function splitParameterSegments(value: string) {
  const segments: string[] = [];
  let current = "";
  let quoted = false;
  for (const character of value) {
    if (character === '"') quoted = !quoted;
    if (character === ";" && !quoted) { segments.push(current); current = ""; }
    else current += character;
  }
  segments.push(current);
  return segments;
}

function valueSeparator(line: string) {
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') quoted = !quoted;
    if (line[index] === ":" && !quoted) return index;
  }
  return -1;
}

function parseProperty(line: string, lineNumber: number): VCardProperty | null {
  const separator = valueSeparator(line);
  if (separator < 0) return null;
  const segments = splitParameterSegments(line.slice(0, separator));
  const nameSegment = segments.shift() ?? "";
  const nameParts = nameSegment.split(".");
  const bareName = (nameParts.pop() ?? "").toUpperCase();
  const params: Record<string, string[]> = {};
  for (const segment of segments) {
    const equals = segment.indexOf("=");
    const key = (equals < 0 ? "TYPE" : segment.slice(0, equals)).toUpperCase();
    const raw = equals < 0 ? segment : segment.slice(equals + 1);
    params[key] = (params[key] ?? []).concat(raw.replace(/^"|"$/g, "").split(",").map((item) => decodeParameterValue(item.trim())).filter(Boolean));
  }
  const rawValue = line.slice(separator + 1);
  return { name: bareName, group: nameParts.length ? nameParts.join(".") : undefined, params, rawValue, value: decodeValue(rawValue, params), raw: line, line: lineNumber };
}

function unfold(text: string) {
  const rawLines = text.split(/\r\n|\n|\r/);
  return rawLines.reduce<{ line: string; sourceLine: number }[]>((lines, line, index) => {
    const previous = lines.at(-1)?.line ?? "";
    if (/^[ \t]/.test(line) && lines.length) lines[lines.length - 1].line += line.slice(1);
    else if (/ENCODING=QUOTED-PRINTABLE/i.test(previous) && previous.endsWith("=") && lines.length) lines[lines.length - 1].line = `${previous.slice(0, -1)}${line}`;
    else if (/^(PHOTO|LOGO)(?:;[^:]*)?;ENCODING=(?:B|BASE64):/i.test(previous) && line && !line.includes(":") && lines.length) lines[lines.length - 1].line += line.trim();
    else lines.push({ line, sourceLine: index + 1 });
    return lines;
  }, []);
}

function lineEndingFor(text: string): ParseResult["lineEnding"] {
  const endings = text.match(/\r\n|\n|\r/g) ?? [];
  const kinds = new Set(endings.map((ending) => ending === "\r\n" ? "CRLF" : ending === "\n" ? "LF" : "CR"));
  return kinds.size > 1 ? "mixed" : ([...kinds][0] as ParseResult["lineEnding"] | undefined) ?? "LF";
}

function createContact(lines: { line: string; sourceLine: number }[], index: number): Contact {
  const issues: ValidationIssue[] = [];
  const properties = lines.map(({ line, sourceLine }) => parseProperty(line, sourceLine)).filter((item): item is VCardProperty => Boolean(item));
  lines.forEach(({ line, sourceLine }) => { if (line.trim() && !line.includes(":")) issues.push({ code: "MALFORMED_LINE", severity: "warning", message: `Line ${sourceLine} has no property separator.`, line: sourceLine }); });
  const get = (name: string) => properties.find((item) => item.name === name)?.value ?? "";
  const getAll = (name: string) => properties.filter((item) => item.name === name).map((item) => item.value);
  const getTypes = (name: string) => properties.filter((item) => item.name === name).map((item) => item.params.TYPE?.join(",") ?? "");
  const versionValue = get("VERSION");
  const version: VCardVersion = versionValue === "2.1" || versionValue === "3.0" || versionValue === "4.0" ? versionValue : "unknown";
  const structuredName = properties.find((item) => item.name === "N");
  const nameParts = structuredName ? splitEscaped(structuredName.rawValue, ";").map(unescapeValue) : [];
  const formattedName = get("FN") || [nameParts[1], nameParts[0]].filter(Boolean).join(" ");
  if (!versionValue) issues.push({ code: "MISSING_VERSION", severity: "warning", message: "This contact does not declare a vCard version.", property: "VERSION" });
  if (!formattedName) issues.push({ code: "MISSING_FN", severity: "warning", message: "This contact has no formatted name.", property: "FN" });
  const singletonNames = ["VERSION", "FN", "N", "UID", "BDAY"];
  singletonNames.forEach((name) => { const duplicates = properties.filter((item) => item.name === name); if (duplicates.length > 1) issues.push({ code: "REPEATED_SINGLETON", severity: "warning", message: `${name} appears ${duplicates.length} times in one contact.`, property: name, line: duplicates[1].line }); });
  properties.forEach((property) => {
    if (!/^[A-Z0-9-]+$/.test(property.name)) issues.push({ code: "INVALID_PROPERTY_NAME", severity: "error", message: `Line ${property.line} has an invalid property name.`, property: property.name, line: property.line });
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(property.value)) issues.push({ code: "CONTROL_CHARACTER", severity: "warning", message: `${property.name} contains an unsafe control character.`, property: property.name, line: property.line });
  });
  const birthday = get("BDAY");
  if (birthday && !/^\d{4}-?\d{2}-?\d{2}$|^--\d{2}-?\d{2}$/.test(birthday)) issues.push({ code: "INVALID_BDAY", severity: "warning", message: "The birthday value has an unusual date format.", property: "BDAY" });
  const photo = get("PHOTO");
  if (photo.length > 12 * 1024 * 1024) issues.push({ code: "LARGE_PHOTO", severity: "warning", message: "An embedded photo is unusually large and may exhaust browser memory.", property: "PHOTO" });
  const unknownProperties = properties.filter((item) => !KNOWN_PROPERTIES.has(item.name));
  return {
    id: `contact-${index + 1}`,
    version,
    firstName: nameParts[1] ?? "",
    lastName: nameParts[0] ?? "",
    formattedName,
    phones: getAll("TEL").map((value) => value.replace(/^tel:/i, "")),
    emails: getAll("EMAIL"),
    phoneTypes: getTypes("TEL"),
    emailTypes: getTypes("EMAIL"),
    organisation: splitEscaped(properties.find((item) => item.name === "ORG")?.rawValue ?? "", ";").map(unescapeValue)[0] ?? "",
    title: get("TITLE"),
    note: get("NOTE"),
    uid: get("UID"),
    categories: splitEscaped(properties.find((item) => item.name === "CATEGORIES")?.rawValue ?? "", ",").map(unescapeValue).map((item) => item.trim()).filter(Boolean),
    photo,
    photoType: properties.find((item) => item.name === "PHOTO")?.params.MEDIATYPE?.[0] ?? properties.find((item) => item.name === "PHOTO")?.params.TYPE?.[0],
    nickname: get("NICKNAME"),
    department: splitEscaped(properties.find((item) => item.name === "ORG")?.rawValue ?? "", ";").map(unescapeValue)[1] ?? "",
    role: get("ROLE"),
    url: get("URL"),
    birthday: get("BDAY"),
    address: get("ADR"),
    rawProperties: lines.map(({ line }) => line),
    properties: unknownProperties,
    issues,
  };
}

export function parseVCard(text: string): ParseResult {
  const cleanText = text.replace(/^\uFEFF/, "");
  const logicalLines = unfold(cleanText);
  const warnings: string[] = [];
  const issues: ValidationIssue[] = [];
  const contacts: Contact[] = [];
  let current: { line: string; sourceLine: number }[] | null = null;
  logicalLines.forEach((entry) => {
    const normalized = entry.line.trim().toUpperCase();
    if (normalized === "BEGIN:VCARD") {
      if (current) issues.push({ code: "NESTED_CARD", severity: "warning", message: `A new contact started before the previous one ended.`, line: entry.sourceLine });
      current = [entry];
    } else if (normalized === "END:VCARD") {
      if (!current) issues.push({ code: "ORPHAN_END", severity: "warning", message: "Found END:VCARD without BEGIN:VCARD.", line: entry.sourceLine });
      else { current.push(entry); const contact = createContact(current, contacts.length); contacts.push(contact); issues.push(...contact.issues); current = null; }
    } else if (current) current.push(entry);
    else if (entry.line.trim()) issues.push({ code: "OUTSIDE_CARD", severity: "warning", message: `Ignored text outside a vCard: ${entry.line.slice(0, 60)}`, line: entry.sourceLine });
  });
  if (current) issues.push({ code: "MISSING_END", severity: "error", message: "The last contact is missing END:VCARD and was not imported." });
  if (!contacts.length) issues.push({ code: "NO_CARDS", severity: "error", message: "No BEGIN:VCARD / END:VCARD blocks were found." });
  const versions = contacts.reduce<Record<string, number>>((result, contact) => { result[contact.version] = (result[contact.version] ?? 0) + 1; return result; }, {});
  return { contacts, warnings: issues.map((issue) => issue.message), issues, versions, lineEnding: lineEndingFor(cleanText), encoding: "UTF-8", totalLines: logicalLines.length };
}

export function decodeVCardBytes(bytes: ArrayBuffer): { text: string; encoding: ParseResult["encoding"] } {
  const view = new Uint8Array(bytes);
  if (view[0] === 0xff && view[1] === 0xfe) return { text: new TextDecoder("utf-16le").decode(view.slice(2)), encoding: "UTF-16LE" };
  if (view[0] === 0xfe && view[1] === 0xff) return { text: new TextDecoder("utf-16be").decode(view.slice(2)), encoding: "UTF-16BE" };
  if (view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf) return { text: new TextDecoder("utf-8").decode(view), encoding: "UTF-8" };
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(view), encoding: "UTF-8" };
  } catch {
    // Bytes that are not valid UTF-8 almost always come from legacy Windows
    // exports; decoding them as Windows-1252 keeps accented names readable.
    return { text: new TextDecoder("windows-1252").decode(view), encoding: "Windows-1252" };
  }
}

function utf8Size(character: string) {
  const codePoint = character.codePointAt(0) ?? 0;
  return codePoint < 0x80 ? 1 : codePoint < 0x800 ? 2 : codePoint < 0x10000 ? 3 : 4;
}

function utf8Length(value: string) {
  let total = 0;
  for (const character of value) total += utf8Size(character);
  return total;
}

function utf8Prefix(value: string, byteLimit: number) {
  let bytes = 0; let end = 0;
  for (const character of value) {
    const size = utf8Size(character);
    if (bytes + size > byteLimit) break;
    bytes += size; end += character.length;
  }
  return Math.max(1, end);
}

function foldLine(line: string) {
  if (utf8Length(line) <= 75) return [line];
  const folded: string[] = []; let remaining = line; let firstLine = true;
  while (remaining) {
    const limit = firstLine ? 75 : 74;
    const end = utf8Prefix(remaining, limit);
    folded.push(`${firstLine ? "" : " "}${remaining.slice(0, end)}`);
    remaining = remaining.slice(end); firstLine = false;
  }
  return folded;
}

export function serializeVCard(contact: Contact, versionOrOptions: KnownVCardVersion | SerializeOptions = "3.0") {
  const options: Required<SerializeOptions> = typeof versionOrOptions === "string" ? { version: versionOrOptions, lineEnding: "CRLF", preserveUnknown: true, includePhotos: true } : { version: "3.0", lineEnding: "CRLF", preserveUnknown: true, includePhotos: true, ...versionOrOptions };
  const name = [contact.lastName, contact.firstName, "", "", ""].map(escapeValue).join(";");
  const lines = ["BEGIN:VCARD", `VERSION:${options.version}`, `N:${name}`, `FN:${escapeValue(contact.formattedName || [contact.firstName, contact.lastName].filter(Boolean).join(" "))}`];
  contact.phones.forEach((phone, index) => { if (phone.trim()) { const value = options.version === "4.0" && !/^tel:/i.test(phone.trim()) ? `tel:${phone.trim()}` : phone.trim(); lines.push(`TEL;TYPE=${(contact.phoneTypes?.[index] || "CELL").replace(/[^A-Za-z0-9,-]/g, "")}:${escapeValue(value)}`); } });
  contact.emails.forEach((email, index) => { if (email.trim()) lines.push(`EMAIL;TYPE=${escapeValue(contact.emailTypes?.[index] || "INTERNET")}:${escapeValue(email.trim())}`); });
  if (contact.organisation.trim()) lines.push(`ORG:${[contact.organisation.trim(), contact.department?.trim() ?? ""].map(escapeValue).join(";")}`);
  if (contact.title.trim()) lines.push(`TITLE:${escapeValue(contact.title.trim())}`);
  if (contact.note.trim()) lines.push(`NOTE:${escapeValue(contact.note.trim())}`);
  if (contact.uid.trim()) lines.push(`UID:${escapeValue(contact.uid.trim())}`);
  if (contact.categories.length) lines.push(`CATEGORIES:${contact.categories.map(escapeValue).join(",")}`);
  if (options.includePhotos && contact.photo.trim()) {
    const data = contact.photo.match(/^data:([^;,]+);base64,([\s\S]+)$/i);
    const mediaType = data?.[1] || contact.photoType || "image/jpeg";
    const photoValue = data?.[2] ?? contact.photo;
    if (/^(https?|ftp):/i.test(photoValue)) lines.push(`PHOTO;VALUE=URI:${escapeValue(photoValue)}`);
    else if (options.version === "4.0") lines.push(`PHOTO:data:${mediaType};base64,${photoValue.replace(/\s+/g, "")}`);
    else lines.push(`PHOTO;ENCODING=b;TYPE=${mediaType.replace(/^image\//i, "").toUpperCase()}:${photoValue.replace(/\s+/g, "")}`);
  }
  if (contact.nickname?.trim()) lines.push(`NICKNAME:${escapeValue(contact.nickname.trim())}`);
  if (contact.role?.trim()) lines.push(`ROLE:${escapeValue(contact.role.trim())}`);
  if (contact.url?.trim()) lines.push(`URL:${escapeValue(contact.url.trim())}`);
  if (contact.birthday?.trim()) lines.push(`BDAY:${escapeValue(contact.birthday.trim())}`);
  if (contact.address?.trim()) lines.push(`ADR:${splitEscaped(contact.address.trim(), ";").map((part) => escapeValue(unescapeValue(part))).join(";")}`);
  if (options.preserveUnknown) contact.properties.forEach((item) => { if (!KNOWN_PROPERTIES.has(item.name)) lines.push(item.raw); });
  lines.push("END:VCARD");
  const separator = options.lineEnding === "LF" ? "\n" : "\r\n";
  return lines.flatMap(foldLine).join(separator);
}

export function serializeVCards(contacts: Contact[], versionOrOptions: KnownVCardVersion | SerializeOptions = "3.0") {
  const options = typeof versionOrOptions === "string" ? { version: versionOrOptions } : versionOrOptions;
  const lineEnding = options.lineEnding === "LF" ? "\n" : "\r\n";
  return `${contacts.map((contact) => serializeVCard(contact, versionOrOptions)).join(`${lineEnding}${lineEnding}`)}${lineEnding}`;
}

export function createChangeReport(inputCount: number, outputContacts: Contact[], parseResult: ParseResult, options: SerializeOptions) {
  return [
    "vCard Editor change report",
    `Input contacts: ${inputCount}`,
    `Output contacts: ${outputContacts.length}`,
    `Output version: ${options.version ?? "3.0"}`,
    `Unknown fields preserved: ${options.preserveUnknown === false ? "no" : "yes"}`,
    `Photos included: ${options.includePhotos === false ? "no" : "yes"}`,
    `Warnings: ${parseResult.issues.length}`,
    ...parseResult.issues.map((issue) => `- ${issue.severity}: ${issue.message}`),
  ].join("\n");
}
