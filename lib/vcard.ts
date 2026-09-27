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
  /** Original ordered properties and the editable projection at import time. */
  forceProperties?: string[];
  source?: { properties: VCardProperty[]; values: Contact; block?: string };
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

const KNOWN_PROPERTIES = new Set([
  "BEGIN",
  "END",
  "VERSION",
  "N",
  "FN",
  "TEL",
  "EMAIL",
  "ORG",
  "TITLE",
  "NOTE",
  "UID",
  "CATEGORIES",
  "PHOTO",
  "PRODID",
  "NICKNAME",
  "ROLE",
  "URL",
  "BDAY",
  "ADR",
]);

export function splitEscaped(value: string, delimiter: string) {
  const parts: string[] = [];
  let current = "";
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      current += `\\${character}`;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === delimiter) {
      parts.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if (escaped) current += "\\";
  parts.push(current);
  return parts;
}

export function unescapeValue(value: string) {
  return value.replace(/\\(\\|n|,|;)/gi, (_, character: string) =>
    character.toLowerCase() === "n" ? "\n" : character,
  );
}

export function escapeValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function decodeQuotedPrintable(value: string, charset = "utf-8") {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (
      value[index] === "=" &&
      /^[0-9A-Fa-f]{2}$/.test(value.slice(index + 1, index + 3))
    ) {
      bytes.push(Number.parseInt(value.slice(index + 1, index + 3), 16));
      index += 2;
    } else bytes.push(value.charCodeAt(index));
  }
  try {
    return new TextDecoder(charset, { fatal: false }).decode(
      new Uint8Array(bytes),
    );
  } catch {
    return value;
  }
}

function decodeParameterValue(value: string) {
  return value.replace(/\^(\^|'|n)/gi, (_, character: string) =>
    character.toLowerCase() === "n" ? "\n" : character === "'" ? '"' : "^",
  );
}

function decodeValue(value: string, params: Record<string, string[]>) {
  const encoding = params.ENCODING?.[0]?.toUpperCase();
  return unescapeValue(
    encoding === "QUOTED-PRINTABLE"
      ? decodeQuotedPrintable(value, params.CHARSET?.[0])
      : value,
  );
}

export function splitStructuredValue(value: string) {
  return splitEscaped(value, ";").map(unescapeValue);
}

export function joinStructuredValue(parts: string[]) {
  return parts.map(escapeValue).join(";");
}

function structuredParts(property: VCardProperty | undefined, delimiter = ";") {
  if (!property) return [];
  const value =
    property.params.ENCODING?.[0]?.toUpperCase() === "QUOTED-PRINTABLE"
      ? decodeQuotedPrintable(property.rawValue, property.params.CHARSET?.[0])
      : property.rawValue;
  return splitEscaped(value, delimiter).map(unescapeValue);
}

function splitParameterSegments(value: string, delimiter = ";") {
  const segments: string[] = [];
  let current = "";
  let quoted = false;
  for (const character of value) {
    if (character === '"') quoted = !quoted;
    if (character === delimiter && !quoted) {
      segments.push(current);
      current = "";
    } else current += character;
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

export function parseProperty(
  line: string,
  lineNumber: number,
): VCardProperty | null {
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
    params[key] = (params[key] ?? []).concat(
      splitParameterSegments(raw, ",")
        .flatMap((item) => {
          const decoded = decodeParameterValue(
            item.trim().replace(/^"|"$/g, ""),
          );
          return key === "TYPE" ? decoded.split(",") : [decoded];
        })
        .filter(Boolean),
    );
  }
  const rawValue = line.slice(separator + 1);
  return {
    name: bareName,
    group: nameParts.length ? nameParts.join(".") : undefined,
    params,
    rawValue,
    value: decodeValue(rawValue, params),
    raw: line,
    line: lineNumber,
  };
}

function unfold(text: string) {
  const rawLines = text.split(/\r\n|\n|\r/);
  return rawLines.reduce<{ line: string; sourceLine: number }[]>(
    (lines, line, index) => {
      const previous = lines.at(-1)?.line ?? "";
      if (/^[ \t]/.test(line) && lines.length)
        lines[lines.length - 1].line += line.slice(1);
      else if (
        /ENCODING=QUOTED-PRINTABLE/i.test(previous) &&
        previous.endsWith("=") &&
        lines.length
      )
        lines[lines.length - 1].line = `${previous.slice(0, -1)}${line}`;
      else if (
        /^(PHOTO|LOGO)(?:;[^:]*)?;ENCODING=(?:B|BASE64):/i.test(previous) &&
        line &&
        !line.includes(":") &&
        lines.length
      )
        lines[lines.length - 1].line += line.trim();
      else lines.push({ line, sourceLine: index + 1 });
      return lines;
    },
    [],
  );
}

function lineEndingFor(text: string): ParseResult["lineEnding"] {
  const endings = text.match(/\r\n|\n|\r/g) ?? [];
  const kinds = new Set(
    endings.map((ending) =>
      ending === "\r\n" ? "CRLF" : ending === "\n" ? "LF" : "CR",
    ),
  );
  return kinds.size > 1
    ? "mixed"
    : (([...kinds][0] as ParseResult["lineEnding"] | undefined) ?? "LF");
}

function createContact(
  lines: { line: string; sourceLine: number }[],
  index: number,
): Contact {
  const issues: ValidationIssue[] = [];
  const properties = lines
    .map(({ line, sourceLine }) => parseProperty(line, sourceLine))
    .filter((item): item is VCardProperty => Boolean(item));
  lines.forEach(({ line, sourceLine }) => {
    if (line.trim() && !line.includes(":"))
      issues.push({
        code: "MALFORMED_LINE",
        severity: "warning",
        message: `Line ${sourceLine} has no property separator.`,
        line: sourceLine,
      });
  });
  const get = (name: string) =>
    properties.find((item) => item.name === name)?.value ?? "";
  const getAll = (name: string) =>
    properties.filter((item) => item.name === name).map((item) => item.value);
  const getTypes = (name: string) =>
    properties
      .filter((item) => item.name === name)
      .map((item) => item.params.TYPE?.join(",") ?? "");
  const versionValue = get("VERSION");
  const version: VCardVersion =
    versionValue === "2.1" || versionValue === "3.0" || versionValue === "4.0"
      ? versionValue
      : "unknown";
  const structuredName = properties.find((item) => item.name === "N");
  const nameParts = structuredParts(structuredName);
  const formattedName =
    get("FN") || [nameParts[1], nameParts[0]].filter(Boolean).join(" ");
  if (!versionValue)
    issues.push({
      code: "MISSING_VERSION",
      severity: "warning",
      message: "This contact does not declare a vCard version.",
      property: "VERSION",
    });
  if (!get("FN"))
    issues.push({
      code: "MISSING_FN",
      severity: "warning",
      message: "This contact has no formatted name.",
      property: "FN",
    });
  const singletonNames = ["VERSION", "FN", "N", "UID", "BDAY"];
  singletonNames.forEach((name) => {
    const duplicates = properties.filter((item) => item.name === name);
    if (duplicates.length > 1)
      issues.push({
        code: "REPEATED_SINGLETON",
        severity: "warning",
        message: `${name} appears ${duplicates.length} times in one contact.`,
        property: name,
        line: duplicates[1].line,
      });
  });
  properties.forEach((property) => {
    if (!/^[A-Z0-9-]+$/.test(property.name))
      issues.push({
        code: "INVALID_PROPERTY_NAME",
        severity: "error",
        message: `Line ${property.line} has an invalid property name.`,
        property: property.name,
        line: property.line,
      });
    // eslint-disable-next-line no-control-regex -- Deliberate handling of unsafe control characters.
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(property.value))
      issues.push({
        code: "CONTROL_CHARACTER",
        severity: "warning",
        message: `${property.name} contains an unsafe control character.`,
        property: property.name,
        line: property.line,
      });
  });
  const birthday = get("BDAY");
  if (birthday && !/^\d{4}-?\d{2}-?\d{2}$|^--\d{2}-?\d{2}$/.test(birthday))
    issues.push({
      code: "INVALID_BDAY",
      severity: "warning",
      message: "The birthday value has an unusual date format.",
      property: "BDAY",
    });
  const photo = get("PHOTO");
  if (photo.length > 12 * 1024 * 1024)
    issues.push({
      code: "LARGE_PHOTO",
      severity: "warning",
      message:
        "An embedded photo is unusually large and may exhaust browser memory.",
      property: "PHOTO",
    });
  const unknownProperties = properties.filter(
    (item) => !KNOWN_PROPERTIES.has(item.name),
  );
  const contact: Contact = {
    id: `contact-${index + 1}`,
    version,
    firstName: nameParts[1] ?? "",
    lastName: nameParts[0] ?? "",
    formattedName,
    phones: getAll("TEL").map((value) => value.replace(/^tel:/i, "")),
    emails: getAll("EMAIL"),
    phoneTypes: getTypes("TEL"),
    emailTypes: getTypes("EMAIL"),
    organisation:
      structuredParts(properties.find((item) => item.name === "ORG"))[0] ?? "",
    title: get("TITLE"),
    note: get("NOTE"),
    uid: get("UID"),
    categories: splitEscaped(
      properties.find((item) => item.name === "CATEGORIES")?.rawValue ?? "",
      ",",
    )
      .map(unescapeValue)
      .map((item) => item.trim())
      .filter(Boolean),
    photo,
    photoType:
      properties.find((item) => item.name === "PHOTO")?.params.MEDIATYPE?.[0] ??
      properties.find((item) => item.name === "PHOTO")?.params.TYPE?.[0],
    nickname: get("NICKNAME"),
    department:
      structuredParts(properties.find((item) => item.name === "ORG"))[1] ?? "",
    role: get("ROLE"),
    url: get("URL"),
    birthday: get("BDAY"),
    address: joinStructuredValue(
      structuredParts(properties.find((item) => item.name === "ADR")),
    ),
    rawProperties: lines.map(({ line }) => line),
    properties: unknownProperties,
    issues,
  };
  contact.source = { properties, values: { ...contact } };
  return contact;
}

export function parseVCard(text: string): ParseResult {
  if (new TextEncoder().encode(text).byteLength > 25 * 1024 * 1024)
    throw new Error("VCF text exceeds the 25 MB limit.");
  const cleanText = text.replace(/^\uFEFF/, "");
  const logicalLines = unfold(cleanText);
  if (logicalLines.length > 500000)
    throw new Error(
      "The file exceeds 500,000 property lines. Split it before opening.",
    );
  const issues: ValidationIssue[] = [];
  const contacts: Contact[] = [];
  let current: { line: string; sourceLine: number }[] | null = null;
  logicalLines.forEach((entry) => {
    const normalized = entry.line.trim().toUpperCase();
    if (normalized === "BEGIN:VCARD") {
      if (current)
        issues.push({
          code: "NESTED_CARD",
          severity: "warning",
          message: `A new contact started before the previous one ended.`,
          line: entry.sourceLine,
        });
      current = [entry];
    } else if (normalized === "END:VCARD") {
      if (!current)
        issues.push({
          code: "ORPHAN_END",
          severity: "warning",
          message: "Found END:VCARD without BEGIN:VCARD.",
          line: entry.sourceLine,
        });
      else {
        current.push(entry);
        const contact = createContact(current, contacts.length);
        contacts.push(contact);
        issues.push(...contact.issues);
        current = null;
      }
    } else if (current) current.push(entry);
    else if (entry.line.trim())
      issues.push({
        code: "OUTSIDE_CARD",
        severity: "warning",
        message: `Ignored text outside a vCard: ${entry.line.slice(0, 60)}`,
        line: entry.sourceLine,
      });
  });
  if (current)
    issues.push({
      code: "MISSING_END",
      severity: "error",
      message: "The last contact is missing END:VCARD and was not imported.",
    });
  if (!contacts.length)
    issues.push({
      code: "NO_CARDS",
      severity: "error",
      message: "No BEGIN:VCARD / END:VCARD blocks were found.",
    });
  if (contacts.length > 50000)
    throw new Error("Use a file with at most 50,000 contacts.");
  const blocks = [
    ...cleanText.matchAll(
      /^BEGIN:VCARD[^\S\r\n]*(?:\r\n|\n|\r)[\s\S]*?^END:VCARD[^\S\r\n]*/gim,
    ),
  ];
  if (blocks.length === contacts.length)
    contacts.forEach((contact, index) => {
      if (contact.source) contact.source.block = blocks[index][0];
    });
  const versions = contacts.reduce<Record<string, number>>(
    (result, contact) => {
      result[contact.version] = (result[contact.version] ?? 0) + 1;
      return result;
    },
    {},
  );
  return {
    contacts,
    warnings: issues.map((issue) => issue.message),
    issues,
    versions,
    lineEnding: lineEndingFor(cleanText),
    encoding: "UTF-8",
    totalLines: logicalLines.length,
  };
}

export function decodeVCardBytes(bytes: ArrayBuffer): {
  text: string;
  encoding: ParseResult["encoding"];
} {
  const view = new Uint8Array(bytes);
  if (view[0] === 0xff && view[1] === 0xfe)
    return {
      text: new TextDecoder("utf-16le").decode(view.slice(2)),
      encoding: "UTF-16LE",
    };
  if (view[0] === 0xfe && view[1] === 0xff)
    return {
      text: new TextDecoder("utf-16be").decode(view.slice(2)),
      encoding: "UTF-16BE",
    };
  if (view[0] === 0xef && view[1] === 0xbb && view[2] === 0xbf)
    return { text: new TextDecoder("utf-8").decode(view), encoding: "UTF-8" };
  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(view),
      encoding: "UTF-8",
    };
  } catch {
    // Bytes that are not valid UTF-8 almost always come from legacy Windows
    // exports; decoding them as Windows-1252 keeps accented names readable.
    return {
      text: new TextDecoder("windows-1252").decode(view),
      encoding: "Windows-1252",
    };
  }
}

function utf8Size(character: string) {
  const codePoint = character.codePointAt(0) ?? 0;
  return codePoint < 0x80
    ? 1
    : codePoint < 0x800
      ? 2
      : codePoint < 0x10000
        ? 3
        : 4;
}

function utf8Length(value: string) {
  let total = 0;
  for (const character of value) total += utf8Size(character);
  return total;
}

function utf8Prefix(value: string, byteLimit: number) {
  let bytes = 0;
  let end = 0;
  for (const character of value) {
    const size = utf8Size(character);
    if (bytes + size > byteLimit) break;
    bytes += size;
    end += character.length;
  }
  return Math.max(1, end);
}

export function foldVCardLine(line: string, width = 75) {
  const lineWidth = Number.isFinite(width)
    ? Math.max(5, Math.floor(width))
    : 75;
  if (utf8Length(line) <= lineWidth) return [line];
  const folded: string[] = [];
  let remaining = line;
  let firstLine = true;
  while (remaining) {
    const limit = firstLine ? lineWidth : lineWidth - 1;
    const end = utf8Prefix(remaining, limit);
    folded.push(`${firstLine ? "" : " "}${remaining.slice(0, end)}`);
    remaining = remaining.slice(end);
    firstLine = false;
  }
  return folded;
}

function serializeFreshVCard(
  contact: Contact,
  versionOrOptions: KnownVCardVersion | SerializeOptions = "3.0",
) {
  const options: Required<SerializeOptions> =
    typeof versionOrOptions === "string"
      ? {
          version: versionOrOptions,
          lineEnding: "CRLF",
          preserveUnknown: true,
          includePhotos: true,
        }
      : {
          version: "3.0",
          lineEnding: "CRLF",
          preserveUnknown: true,
          includePhotos: true,
          ...versionOrOptions,
        };
  const name = [contact.lastName, contact.firstName, "", "", ""]
    .map(escapeValue)
    .join(";");
  const lines = [
    "BEGIN:VCARD",
    `VERSION:${options.version}`,
    `N:${name}`,
    `FN:${escapeValue(contact.formattedName || [contact.firstName, contact.lastName].filter(Boolean).join(" "))}`,
  ];
  contact.phones.forEach((phone, index) => {
    if (!phone.trim()) return;
    const number = phone.replace(/^tel:/i, "");
    const uri = `tel:${number}`;
    const asUri = options.version === "4.0" && !/\s/.test(number);
    const type = contact.phoneTypes?.[index];
    const label = type === undefined ? "CELL" : type;
    lines.push(
      `TEL${label ? `;TYPE=${label.replace(/[^A-Za-z0-9,-]/g, "")}` : ""}${options.version === "4.0" ? `;VALUE=${asUri ? "uri" : "text"}` : ""}:${asUri ? uri : escapeValue(number)}`,
    );
  });
  contact.emails.forEach((email, index) => {
    if (email.trim())
      lines.push(
        `EMAIL;TYPE=${(contact.emailTypes?.[index] || "INTERNET").replace(/[^A-Za-z0-9,-]/g, "")}:${escapeValue(email)}`,
      );
  });
  if (contact.organisation.trim())
    lines.push(
      `ORG:${[contact.organisation, contact.department ?? ""].map(escapeValue).join(";")}`,
    );
  if (contact.title.trim()) lines.push(`TITLE:${escapeValue(contact.title)}`);
  if (contact.note.trim()) lines.push(`NOTE:${escapeValue(contact.note)}`);
  if (contact.uid.trim())
    lines.push(
      `UID${options.version === "4.0" && !/^[a-z][a-z0-9+.-]*:/i.test(contact.uid) ? ";VALUE=text" : ""}:${escapeValue(contact.uid)}`,
    );
  if (contact.categories.length)
    lines.push(`CATEGORIES:${contact.categories.map(escapeValue).join(",")}`);
  if (options.includePhotos && contact.photo.trim()) {
    const data = contact.photo.match(/^data:([^;,]+);base64,([\s\S]+)$/i);
    const declaredType = data?.[1] || contact.photoType || "image/jpeg";
    const mediaType = declaredType.includes("/")
      ? declaredType
      : `image/${declaredType.toLowerCase() === "jpg" ? "jpeg" : declaredType.toLowerCase()}`;
    const photoValue = data?.[2] ?? contact.photo;
    if (/^(https?|ftp):/i.test(photoValue))
      lines.push(`PHOTO;VALUE=URI:${photoValue.replace(/[\r\n]/g, "")}`);
    else if (options.version === "4.0")
      lines.push(
        `PHOTO:data:${mediaType};base64,${photoValue.replace(/\s+/g, "")}`,
      );
    else
      lines.push(
        `PHOTO;ENCODING=b;TYPE=${mediaType.replace(/^image\//i, "").toUpperCase()}:${photoValue.replace(/\s+/g, "")}`,
      );
  }
  if (contact.nickname?.trim())
    lines.push(`NICKNAME:${escapeValue(contact.nickname)}`);
  if (contact.role?.trim()) lines.push(`ROLE:${escapeValue(contact.role)}`);
  if (contact.url?.trim())
    lines.push(`URL:${contact.url.trim().replace(/[\r\n]/g, "")}`);
  if (contact.birthday?.trim())
    lines.push(`BDAY:${escapeValue(contact.birthday)}`);
  if (contact.address?.trim())
    lines.push(
      `ADR:${splitEscaped(contact.address.trim(), ";")
        .map((part) => escapeValue(unescapeValue(part)))
        .join(";")}`,
    );
  if (options.preserveUnknown)
    contact.properties.forEach((item) => {
      if (!KNOWN_PROPERTIES.has(item.name)) lines.push(item.raw);
    });
  lines.push("END:VCARD");
  const separator = options.lineEnding === "LF" ? "\n" : "\r\n";
  return lines.flatMap((line) => foldVCardLine(line)).join(separator);
}

/** Encode a modified property while retaining its group and unrelated parameters. */
export function propertyLine(property: VCardProperty) {
  const parameters = Object.entries(property.params)
    .map(([key, values]) => {
      const encoded = values
        .map((value) => {
          const safe = value
            .replace(/\^/g, "^^")
            .replace(/\r\n|\r|\n/g, "^n")
            .replace(/"/g, "^'");
          return /[;:,]/.test(safe) ? `"${safe}"` : safe;
        })
        .join(",");
      return `;${key}=${encoded}`;
    })
    .join("");
  return `${property.group ? `${property.group}.` : ""}${property.name}${parameters}:${property.rawValue}`;
}

function freshProperties(contact: Contact, version: KnownVCardVersion) {
  return unfold(serializeFreshVCard({ ...contact, properties: [] }, version))
    .map(({ line, sourceLine }) => parseProperty(line, sourceLine))
    .filter(
      (item): item is VCardProperty =>
        Boolean(item) && !["BEGIN", "END", "VERSION"].includes(item!.name),
    );
}

function editedProperty(original: VCardProperty, replacement: VCardProperty) {
  const params = { ...original.params };
  delete params.ENCODING;
  delete params.CHARSET;
  if (replacement.name === "TEL" || replacement.name === "EMAIL") {
    if (replacement.params.TYPE) params.TYPE = replacement.params.TYPE;
    else delete params.TYPE;
  }
  if (replacement.name === "TEL") {
    delete params.VALUE;
    if (replacement.params.VALUE) params.VALUE = replacement.params.VALUE;
  }
  if (replacement.name === "PHOTO") {
    delete params.VALUE;
    delete params.TYPE;
    delete params.MEDIATYPE;
    Object.assign(params, replacement.params);
  }
  const updated = { ...replacement, group: original.group, params };
  return { ...updated, raw: propertyLine(updated) };
}

/** Materialize only changed form fields; source properties remain authoritative otherwise. */
export function contactProperties(contact: Contact): VCardProperty[] {
  const version = contact.version === "unknown" ? "3.0" : contact.version;
  const current = freshProperties(contact, version);
  if (!contact.source) return [...current, ...contact.properties];
  const baseline = freshProperties(contact.source.values, version);
  const original = contact.source.properties.filter(
    (p) => !["BEGIN", "END", "VERSION"].includes(p.name),
  );
  const group = (list: VCardProperty[], name: string) =>
    list.filter((p) => p.name === name);
  const changed = new Set(
    [...current, ...baseline]
      .map((p) => p.name)
      .filter(
        (name) =>
          JSON.stringify(group(current, name).map((p) => p.raw)) !==
          JSON.stringify(group(baseline, name).map((p) => p.raw)),
      ),
  );
  const fields: Record<string, (keyof Contact)[]> = {
    N: ["firstName", "lastName"],
    FN: ["formattedName"],
    TEL: ["phones", "phoneTypes"],
    EMAIL: ["emails", "emailTypes"],
    ORG: ["organisation", "department"],
    TITLE: ["title"],
    NOTE: ["note"],
    UID: ["uid"],
    CATEGORIES: ["categories"],
    PHOTO: ["photo", "photoType"],
    NICKNAME: ["nickname"],
    ROLE: ["role"],
    URL: ["url"],
    BDAY: ["birthday"],
    ADR: ["address"],
  };
  for (const [name, keys] of Object.entries(fields)) {
    if (
      keys.some(
        (key) =>
          JSON.stringify(contact[key]) !==
          JSON.stringify(contact.source!.values[key]),
      )
    )
      changed.add(name);
  }
  contact.forceProperties?.forEach((name) => changed.add(name));
  const replacements = new Map<string, VCardProperty[]>();
  for (const name of changed) {
    const next = group(current, name);
    const previous = group(original, name);
    if (name === "TEL" || name === "EMAIL") {
      const used = new Set<number>();
      replacements.set(
        name,
        next.map((item, index) => {
          const key = (p: VCardProperty) =>
            name === "EMAIL"
              ? p.value.trim().toLowerCase()
              : p.value.replace(/^tel:/i, "");
          let sourceIndex = previous.findIndex(
            (p, i) => !used.has(i) && key(p) === key(item),
          );
          if (
            sourceIndex < 0 &&
            next.length === previous.length &&
            !used.has(index)
          )
            sourceIndex = index;
          if (sourceIndex < 0) return item;
          used.add(sourceIndex);
          const updated = editedProperty(previous[sourceIndex], item);
          // An empty type in the form represents the absence of TYPE, not a default label.
          const types =
            name === "TEL" ? contact.phoneTypes : contact.emailTypes;
          if (types && !types[index]) {
            delete updated.params.TYPE;
            updated.raw = propertyLine(updated);
          }
          return updated;
        }),
      );
    } else if (!next.length)
      replacements.set(
        name,
        contact.forceProperties?.includes(name) ? [] : previous.slice(1),
      );
    else {
      let replacement = next[0];
      if (previous[0] && ["N", "ORG", "ADR"].includes(name)) {
        const property = previous[0];
        const decoded =
          property.params.ENCODING?.[0]?.toUpperCase() === "QUOTED-PRINTABLE"
            ? decodeQuotedPrintable(
                property.rawValue,
                property.params.CHARSET?.[0],
              )
            : property.rawValue;
        const parts = splitEscaped(decoded, ";");
        if (name === "ADR") {
          const prior = splitStructuredValue(
            contact.source.values.address ?? "",
          );
          const nextParts = splitStructuredValue(contact.address ?? "");
          nextParts.forEach((part, index) => {
            if (part !== prior[index]) parts[index] = escapeValue(part);
          });
        } else {
          const fields =
            name === "N"
              ? (["lastName", "firstName"] as const)
              : (["organisation", "department"] as const);
          fields.forEach((field, index) => {
            if (contact[field] !== contact.source!.values[field])
              parts[index] = escapeValue(contact[field] ?? "");
          });
        }
        while (name === "N" && parts.length < 5) parts.push("");
        replacement = {
          ...replacement,
          rawValue: parts.join(";"),
          value: unescapeValue(parts.join(";")),
        };
      }
      replacements.set(name, [
        previous[0] ? editedProperty(previous[0], replacement) : replacement,
        ...previous.slice(1),
      ]);
    }
  }
  const output: VCardProperty[] = [];
  const emitted = new Set<string>();
  const unknown = new Set(contact.properties.map((p) => p.raw));
  for (const property of original) {
    if (!KNOWN_PROPERTIES.has(property.name)) {
      if (unknown.has(property.raw)) output.push(property);
      continue;
    }
    if (!changed.has(property.name)) {
      output.push(property);
      continue;
    }
    if (!emitted.has(property.name))
      output.push(...(replacements.get(property.name) ?? []));
    emitted.add(property.name);
  }
  for (const [name, items] of replacements)
    if (!emitted.has(name)) output.push(...items);
  for (const property of contact.properties)
    if (!original.some((p) => p.raw === property.raw)) output.push(property);
  return output;
}

export function conversionWarnings(
  contacts: Contact[],
  version?: KnownVCardVersion,
) {
  const warnings = new Set<string>();
  if (
    version &&
    version !== "4.0" &&
    contacts.some((contact) =>
      contactProperties(contact).some(
        (property) => Number(property.params.PREF?.[0]) > 1,
      ),
    )
  )
    warnings.add(
      "Preference ranks above 1 have no exact legacy representation and are omitted when converting to vCard 2.1/3.0.",
    );
  if (version && contacts.some((contact) => contact.version !== version))
    warnings.add(
      `Converting to vCard ${version} rewrites syntax. Destination-specific and vendor properties may need review in the receiving app.`,
    );
  if (
    contacts.some((contact) =>
      contact.issues.some((issue) => issue.code === "MALFORMED_LINE"),
    )
  )
    warnings.add(
      "Malformed source lines cannot be represented after editing; keep the original file.",
    );
  return [...warnings];
}

export function serializeVCard(
  contact: Contact,
  versionOrOptions: KnownVCardVersion | SerializeOptions = {},
) {
  const options =
    typeof versionOrOptions === "string"
      ? { version: versionOrOptions }
      : versionOrOptions;
  const version =
    options.version ??
    (contact.version === "unknown" ? "3.0" : contact.version);
  const separator = options.lineEnding === "LF" ? "\n" : "\r\n";
  const properties = contactProperties(contact).filter(
    (p) =>
      (options.includePhotos !== false || p.name !== "PHOTO") &&
      (options.preserveUnknown !== false || KNOWN_PROPERTIES.has(p.name)),
  );
  const original = contact.source?.properties.filter(
    (p) => !["BEGIN", "END", "VERSION"].includes(p.name),
  );
  if (
    version === contact.version &&
    contact.source?.block &&
    JSON.stringify(properties.map((p) => p.raw)) ===
      JSON.stringify(original?.map((p) => p.raw))
  ) {
    return options.lineEnding
      ? contact.source.block.replace(/\r\n|\r|\n/g, separator)
      : contact.source.block;
  }
  const lines = properties.map((property) => {
    if (version === contact.version) return property.raw;
    const updated = { ...property, params: { ...property.params } };
    if (updated.params.ENCODING?.[0]?.toUpperCase() === "QUOTED-PRINTABLE")
      updated.rawValue = decodeQuotedPrintable(
        updated.rawValue,
        updated.params.CHARSET?.[0],
      );
    delete updated.params.CHARSET;
    if (updated.name !== "PHOTO") delete updated.params.ENCODING;
    if (updated.name === "TEL") {
      const number = updated.value.replace(/^tel:/i, "");
      const asUri = version === "4.0" && !/\s/.test(number);
      updated.rawValue = asUri ? `tel:${number}` : escapeValue(number);
      if (version === "4.0") updated.params.VALUE = [asUri ? "uri" : "text"];
      else delete updated.params.VALUE;
    }
    if (updated.name === "UID") {
      if (version === "4.0" && !/^[a-z][a-z0-9+.-]*:/i.test(updated.value))
        updated.params.VALUE = ["text"];
      else delete updated.params.VALUE;
    }
    if (updated.name === "PHOTO") {
      const converted = freshProperties(
        {
          ...contact,
          photo: updated.value,
          photoType: updated.params.MEDIATYPE?.[0] ?? updated.params.TYPE?.[0],
          properties: [],
        },
        version,
      ).find((p) => p.name === "PHOTO");
      if (converted) return propertyLine(editedProperty(updated, converted));
    }
    if (
      version === "4.0" &&
      updated.params.TYPE?.some((value) => value.toUpperCase() === "PREF")
    ) {
      updated.params.PREF = ["1"];
      updated.params.TYPE = updated.params.TYPE.filter(
        (value) => value.toUpperCase() !== "PREF",
      );
      if (!updated.params.TYPE.length) delete updated.params.TYPE;
    } else if (version !== "4.0" && updated.params.PREF) {
      if (updated.params.PREF[0] === "1")
        updated.params.TYPE = [...(updated.params.TYPE ?? []), "PREF"];
      delete updated.params.PREF;
    }
    return propertyLine(updated);
  });
  return ["BEGIN:VCARD", `VERSION:${version}`, ...lines, "END:VCARD"]
    .flatMap((line) => foldVCardLine(line))
    .join(separator);
}

export function serializeVCards(
  contacts: Contact[],
  versionOrOptions: KnownVCardVersion | SerializeOptions = {},
) {
  const options =
    typeof versionOrOptions === "string"
      ? { version: versionOrOptions }
      : versionOrOptions;
  const lineEnding = options.lineEnding === "LF" ? "\n" : "\r\n";
  return `${contacts.map((contact) => serializeVCard(contact, versionOrOptions)).join(`${lineEnding}${lineEnding}`)}${lineEnding}`;
}

export function createChangeReport(
  inputCount: number,
  outputContacts: Contact[],
  parseResult: ParseResult,
  options: SerializeOptions,
) {
  return [
    "vCard Editor change report",
    `Input contacts: ${inputCount}`,
    `Output contacts: ${outputContacts.length}`,
    `Output version: ${options.version ?? "original per contact"}`,
    `Unknown fields preserved: ${options.preserveUnknown === false ? "no" : "yes"}`,
    `Photos included: ${options.includePhotos === false ? "no" : "yes"}`,
    `Warnings: ${parseResult.issues.length}`,
    ...conversionWarnings(outputContacts, options.version),
    ...parseResult.issues.map(
      (issue) => `- ${issue.severity}: ${issue.message}`,
    ),
  ].join("\n");
}
