import {
  Contact,
  KnownVCardVersion,
  ParseResult,
  ValidationIssue,
  parseVCard,
  serializeVCard,
  serializeVCards,
  contactProperties,
  propertyLine,
} from "./vcard";

export type CleanerOptions = {
  trimWhitespace: boolean;
  normalizeEmails: boolean;
  normalizePhones: boolean;
  removePhotos: boolean;
  removeEmpty: boolean;
  countryCode: string;
};
export type DuplicateGroup = {
  ids: string[];
  confidence: "high" | "medium";
  reason: string;
};

/** Formatting only: extensions stay separate and regional trunk digits are never guessed. */
export function normalizePhone(value: string, countryCode = "") {
  const original = value.trim();
  const match = original
    .replace(/^tel:/i, "")
    .match(/^([+\d\s().-]+?)(?:(?:;ext=|\s*(?:ext\.?|x)\s*)(\d+))?$/i);
  if (!match) return original;
  const digits = match[1].replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(digits)) return original;
  const prefix = countryCode.trim().replace(/^\+/, "");
  // Adding a literal prefix never removes a leading zero or converts 00 implicitly.
  const number =
    prefix && /^[1-9]\d{0,2}$/.test(prefix) && !digits.startsWith("+")
      ? `+${prefix}${digits}`
      : digits;
  return `${number}${match[2] ? `;ext=${match[2]}` : ""}`;
}

export function phoneKey(value: string) {
  const normalized = normalizePhone(value);
  return /^\+?\d+(?:;ext=\d+)?$/.test(normalized) ? normalized : "";
}

export function normalizeEmails(contacts: Contact[]) {
  return contacts.map((contact) => {
    const normalized = contact.emails.map(normalizedEmail);
    const indexes = normalized.flatMap((value, index) =>
      !value || normalized.indexOf(value) === index ? [index] : [],
    );
    return {
      ...contact,
      emails: indexes.map((index) => normalized[index]),
      emailTypes: indexes.map((index) => contact.emailTypes?.[index] ?? ""),
    };
  });
}

function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}
function contactLabel(contact: Contact) {
  return (
    contact.formattedName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    contact.emails[0] ||
    contact.phones[0] ||
    "Unnamed contact"
  );
}

/** A note-only or address-only card is still useful; remove only truly empty cards. */
export function isEmptyContact(contact: Contact) {
  return !contactProperties(contact).some((property) => {
    if (["N", "ADR", "ORG"].includes(property.name))
      return (
        property.rawValue.includes("\\") ||
        property.value.replace(/[;,]/g, "").trim().length > 0
      );
    return property.value.trim().length > 0;
  });
}

export function findDuplicateGroups(contacts: Contact[]): DuplicateGroup[] {
  const buckets = new Map<
    string,
    { ids: string[]; confidence: "high" | "medium"; reason: string }
  >();
  contacts.forEach((contact) => {
    const keys: [string, "high" | "medium", string][] = [
      ...contact.phones
        .map(phoneKey)
        .filter(Boolean)
        .map((phone): [string, "high", string] => [
          `phone:${phone}`,
          "high",
          "matching phone number",
        ]),
      ...contact.emails
        .filter(Boolean)
        .map((email): [string, "high", string] => [
          `email:${normalizedEmail(email)}`,
          "high",
          "matching email address",
        ]),
    ];
    const name = contactLabel(contact)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (name && name !== "unnamed contact")
      keys.push([`name:${name}`, "medium", "matching contact name"]);
    keys.forEach(([key, confidence, reason]) => {
      const bucket = buckets.get(key) ?? { ids: [], confidence, reason };
      if (!bucket.ids.includes(contact.id)) bucket.ids.push(contact.id);
      if (confidence === "high") {
        bucket.confidence = "high";
        bucket.reason = reason;
      }
      buckets.set(key, bucket);
    });
  });
  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();
  [...buckets.values()]
    .filter((bucket) => bucket.ids.length > 1)
    .forEach((bucket) => {
      const ids = [...bucket.ids].sort();
      const signature = ids.join("|");
      if (!seen.has(signature)) {
        groups.push({
          ids,
          confidence: bucket.confidence,
          reason: bucket.reason,
        });
        seen.add(signature);
      }
    });
  return groups.sort(
    (a, b) =>
      (a.confidence === "high" ? -1 : 1) - (b.confidence === "high" ? -1 : 1),
  );
}

export function mergeContactGroup(
  contacts: Contact[],
  ids: string[],
  primaryId?: string,
) {
  const members = contacts.filter((contact) => ids.includes(contact.id));
  if (members.length < 2) return contacts;
  const primary =
    members.find((member) => member.id === primaryId) ?? members[0];
  const version = primary.version === "unknown" ? "3.0" : primary.version;
  const properties = contactProperties(primary);
  const singleton = new Set(["N", "FN", "UID", "BDAY", "PRODID"]);
  const dedupeKey = (property: { name: string; value: string; raw: string }) => {
    if (property.name === "EMAIL") return `EMAIL:${normalizedEmail(property.value)}`;
    if (property.name === "TEL") return `TEL:${normalizePhone(property.value)}`;
    return property.raw;
  };
  const seen = new Set(properties.map(dedupeKey));
  const groups = new Set(
    properties.flatMap((property) => (property.group ? [property.group] : [])),
  );
  members
    .filter((member) => member !== primary)
    .forEach((member, index) => {
      const source = parseVCard(serializeVCard(member, version)).contacts[0];
      const renamed = new Map<string, string>();
      for (const property of contactProperties(source)) {
        if (
          singleton.has(property.name) &&
          properties.some((existing) => existing.name === property.name)
        )
          continue;
        let next = property;
        if (property.group) {
          if (!renamed.has(property.group)) {
            let group = property.group;
            while (groups.has(group)) group = `merge${index + 1}-${group}`;
            renamed.set(property.group, group);
            groups.add(group);
          }
          next = { ...property, group: renamed.get(property.group) };
          next.raw = propertyLine(next);
        }
        const key = dedupeKey(next);
        if (!seen.has(key)) {
          properties.push(next);
          seen.add(key);
        }
      }
    });
  const merged = parseVCard(
    [
      "BEGIN:VCARD",
      `VERSION:${version}`,
      ...properties.map((property) => property.raw),
      "END:VCARD",
    ].join("\r\n"),
  ).contacts[0];
  return contacts
    .filter((contact) => !ids.includes(contact.id) || contact.id === primary.id)
    .map((contact) =>
      contact.id === primary.id ? { ...merged, id: primary.id } : contact,
    );
}

export function removeDuplicateGroups(
  contacts: Contact[],
  groups: DuplicateGroup[],
) {
  const idsToRemove = new Set<string>();
  groups.forEach((group) =>
    group.ids.slice(1).forEach((id) => idsToRemove.add(id)),
  );
  return contacts.filter((contact) => !idsToRemove.has(contact.id));
}

export function cleanContacts(contacts: Contact[], options: CleanerOptions) {
  let changed = 0;
  let next = contacts.map((contact) => {
    const cleaned: Contact = {
      ...contact,
      phones: [...contact.phones],
      emails: [...contact.emails],
      categories: [...contact.categories],
    };
    let dirty = false;
    if (options.trimWhitespace) {
      const before = JSON.stringify([
        cleaned.firstName,
        cleaned.lastName,
        cleaned.formattedName,
        cleaned.organisation,
        cleaned.title,
        cleaned.note,
      ]);
      cleaned.firstName = cleaned.firstName.trim();
      cleaned.lastName = cleaned.lastName.trim();
      cleaned.formattedName = cleaned.formattedName.trim();
      cleaned.organisation = cleaned.organisation.trim();
      cleaned.title = cleaned.title.trim();
      cleaned.note = cleaned.note.trim();
      cleaned.phones = cleaned.phones.map((value) => value.trim());
      cleaned.emails = cleaned.emails.map((value) => value.trim());
      if (
        before !==
        JSON.stringify([
          cleaned.firstName,
          cleaned.lastName,
          cleaned.formattedName,
          cleaned.organisation,
          cleaned.title,
          cleaned.note,
        ])
      )
        dirty = true;
    }
    if (options.normalizeEmails) {
      const before = JSON.stringify(cleaned.emails);
      cleaned.emails = cleaned.emails.map(normalizedEmail);
      if (before !== JSON.stringify(cleaned.emails)) dirty = true;
    }
    if (options.normalizePhones) {
      const before = JSON.stringify(cleaned.phones);
      cleaned.phones = cleaned.phones.map((phone) =>
        normalizePhone(phone, options.countryCode),
      );
      if (before !== JSON.stringify(cleaned.phones)) dirty = true;
    }
    if (options.removePhotos && cleaned.photo) {
      cleaned.photo = "";
      cleaned.forceProperties = [...(cleaned.forceProperties ?? []), "PHOTO"];
      dirty = true;
    }
    if (dirty) changed += 1;
    return cleaned;
  });
  if (options.removeEmpty)
    next = next.filter((contact) => !isEmptyContact(contact));
  return { contacts: next, changed };
}

export function validateContacts(
  contacts: Contact[],
  parseResult?: ParseResult,
  options?: { strict?: boolean },
): ValidationIssue[] {
  const strict = options?.strict === true;
  const issues: ValidationIssue[] = parseResult?.issues
    ? [...parseResult.issues]
    : [];
  contacts.forEach((contact) => {
    contact.emails.forEach((email) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        issues.push({
          code: "INVALID_EMAIL",
          severity: "warning",
          message: `${contactLabel(contact)} has an email address with an unusual format.`,
          property: "EMAIL",
        });
    });
    if (isEmptyContact(contact))
      issues.push({
        code: "EMPTY_CONTACT",
        severity: "warning",
        message: `${contactLabel(contact)} has no useful contact fields.`,
        property: "FN",
      });
    if (contact.version === "unknown")
      issues.push({
        code: "UNKNOWN_VERSION",
        severity: "warning",
        message: `${contactLabel(contact)} has an unknown vCard version.`,
        property: "VERSION",
      });
    if (strict) {
      if (!contact.formattedName)
        issues.push({
          code: "REQUIRED_FN",
          severity: "error",
          message: `${contactLabel(contact)} has no FN property; vCard 3.0 and 4.0 require it.`,
          property: "FN",
        });
      if (!contact.firstName && !contact.lastName)
        issues.push({
          code: "MISSING_N",
          severity: "warning",
          message: `${contactLabel(contact)} has no structured N name parts.`,
          property: "N",
        });
    }
  });
  if (!strict) return issues;
  // Escalate structural violations without mutating the shared issue objects.
  return issues.map((issue) =>
    issue.code === "MISSING_VERSION" || issue.code === "MISSING_FN"
      ? { ...issue, severity: "error" as const }
      : issue,
  );
}

export function repairVCardText(
  text: string,
  targetVersion: KnownVCardVersion = "3.0",
) {
  let repaired = text.replace(/^\uFEFF/, "").replace(/\r\n?|\n/g, "\r\n");
  const beginCount = (repaired.match(/BEGIN:VCARD/gi) ?? []).length;
  const endCount = (repaired.match(/END:VCARD/gi) ?? []).length;
  const repairs: string[] = [];
  if (beginCount > endCount) {
    repaired += `${"\r\nEND:VCARD".repeat(beginCount - endCount)}\r\n`;
    repairs.push(
      `Added ${beginCount - endCount} missing END:VCARD marker${beginCount - endCount === 1 ? "" : "s"}.`,
    );
  }
  if (text.startsWith("\uFEFF"))
    repairs.push("Removed the byte-order mark before parsing.");
  if (/\r(?!\n)|(?<!\r)\n/.test(text))
    repairs.push("normalized mixed line endings to CRLF.");
  const parsed = parseVCard(repaired);
  const output = serializeVCards(
    parsed.contacts.map((contact) => ({ ...contact, forceProperties: ["FN"] })),
    {
      version: targetVersion,
      preserveUnknown: true,
      includePhotos: true,
      lineEnding: "CRLF",
    },
  );
  repairs.push(
    `Re-serialised ${parsed.contacts.length} contact${parsed.contacts.length === 1 ? "" : "s"} with vCard ${targetVersion}.`,
  );
  return { output, parsed: parseVCard(output), repairs };
}

export function extractValues(contacts: Contact[], kind: "phones" | "emails") {
  return contacts.flatMap((contact) =>
    contact[kind].filter(Boolean).map((value) => ({
      Value: value,
      Type: kind === "phones" ? "Phone" : "Email",
      Contact: contactLabel(contact),
      Organization: contact.organisation,
    })),
  );
}

export type ExtractionKind =
  | "phones"
  | "emails"
  | "addresses"
  | "companies"
  | "urls"
  | "birthdays"
  | "notes"
  | "extensions"
  | "photos";

export function extractFieldValues(contacts: Contact[], kind: ExtractionKind) {
  return contacts.flatMap((contact) => {
    const fields: Record<ExtractionKind, string[]> = {
      phones: ["TEL"],
      emails: ["EMAIL"],
      addresses: ["ADR"],
      companies: ["ORG", "TITLE"],
      urls: ["URL"],
      birthdays: ["BDAY"],
      notes: ["NOTE"],
      photos: ["PHOTO"],
      extensions: [],
    };
    const values = contactProperties(contact)
      .filter((property) =>
        kind === "extensions"
          ? property.name.startsWith("X-")
          : fields[kind].includes(property.name),
      )
      .map((property) =>
        kind === "extensions"
          ? `${property.name}: ${property.value}`
          : property.value,
      );
    return values.filter(Boolean).map((value) => ({
      Value: value,
      Type: kind,
      Contact: contactLabel(contact),
      Organization: contact.organisation,
    }));
  });
}

export function changeFieldType(
  contacts: Contact[],
  kind: "phone" | "email",
  type: string,
) {
  return contacts.map((contact) =>
    kind === "phone"
      ? { ...contact, phoneTypes: contact.phones.map(() => type) }
      : { ...contact, emailTypes: contact.emails.map(() => type) },
  );
}

export type ContactFilter =
  | "all"
  | "has-phone"
  | "without-phone"
  | "has-email"
  | "without-email"
  | "has-name"
  | "empty";

export function filterContacts(
  contacts: Contact[],
  filter: ContactFilter,
  query = "",
) {
  const needle = query.trim().toLowerCase();
  return contacts.filter((contact) => {
    const searchable =
      `${contactLabel(contact)} ${contact.organisation} ${contact.emails.join(" ")} ${contact.phones.join(" ")} ${contact.note}`.toLowerCase();
    if (needle && !searchable.includes(needle)) return false;
    if (filter === "has-phone") return contact.phones.length > 0;
    if (filter === "without-phone") return contact.phones.length === 0;
    if (filter === "has-email") return contact.emails.length > 0;
    if (filter === "without-email") return contact.emails.length === 0;
    if (filter === "has-name")
      return Boolean(
        contact.formattedName || contact.firstName || contact.lastName,
      );
    if (filter === "empty") return isEmptyContact(contact);
    return true;
  });
}

export function sortContacts(
  contacts: Contact[],
  key: "name" | "organisation" | "email" | "phone" | "file-order",
  direction: "asc" | "desc" = "asc",
) {
  if (key === "file-order")
    return direction === "asc" ? [...contacts] : [...contacts].reverse();
  const value = (contact: Contact) =>
    key === "organisation"
      ? contact.organisation
      : key === "email"
        ? (contact.emails[0] ?? "")
        : key === "phone"
          ? (contact.phones[0] ?? "")
          : contactLabel(contact);
  const multiplier = direction === "asc" ? 1 : -1;
  return [...contacts].sort(
    (a, b) =>
      value(a).localeCompare(value(b), undefined, {
        sensitivity: "base",
        numeric: true,
      }) * multiplier,
  );
}

export function removeDuplicateFields(contacts: Contact[]) {
  return contacts.map((contact) => {
    const phoneIndexes = contact.phones.flatMap((phone, index, values) => {
      const key = phoneKey(phone);
      return !key ||
        values.findIndex((item) => phoneKey(item) === key) === index
        ? [index]
        : [];
    });
    const emailIndexes = contact.emails.flatMap((email, index, values) =>
      !normalizedEmail(email) ||
      values.findIndex(
        (item) => normalizedEmail(item) === normalizedEmail(email),
      ) === index
        ? [index]
        : [],
    );
    return {
      ...contact,
      phones: phoneIndexes.map((i) => contact.phones[i]),
      phoneTypes: phoneIndexes.map((i) => contact.phoneTypes?.[i] ?? ""),
      emails: emailIndexes.map((i) => contact.emails[i]),
      emailTypes: emailIndexes.map((i) => contact.emailTypes?.[i] ?? ""),
      categories: [...new Set(contact.categories)],
    };
  });
}

export type RedactionOptions = {
  removeNotes: boolean;
  removeAddresses: boolean;
  removeBirthdays: boolean;
  removePhotos: boolean;
  removeUrls: boolean;
  removeUnknown?: boolean;
};

export function redactContacts(contacts: Contact[], options: RedactionOptions) {
  return contacts.map((contact) => {
    const removed = new Set(
      [
        options.removeNotes && "NOTE",
        options.removeAddresses && "ADR",
        options.removeBirthdays && "BDAY",
        options.removePhotos && "PHOTO",
        options.removeUrls && "URL",
      ].filter(Boolean),
    );
    const known = new Set([
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
      "NICKNAME",
      "ROLE",
      "URL",
      "BDAY",
      "ADR",
    ]);
    const properties = contactProperties(contact)
      .filter(
        (p) =>
          !removed.has(p.name) &&
          (options.removeUnknown === false || known.has(p.name)),
      )
      .map((p) => {
        if (options.removeUnknown === false) return p;
        const params = Object.fromEntries(
          Object.entries(p.params).filter(([key]) =>
            [
              "TYPE",
              "PREF",
              "VALUE",
              "ENCODING",
              "CHARSET",
              "MEDIATYPE",
              "LANGUAGE",
            ].includes(key),
          ),
        );
        const property = { ...p, group: undefined, params };
        return { ...property, raw: propertyLine(property) };
      });
    const redacted = parseVCard(
      [
        "BEGIN:VCARD",
        `VERSION:${contact.version === "unknown" ? "3.0" : contact.version}`,
        ...properties.map((p) => p.raw),
        "END:VCARD",
      ].join("\r\n"),
    ).contacts[0];
    return { ...redacted, id: contact.id };
  });
}

export function fieldFrequency(contacts: Contact[]) {
  const fields: Record<string, number> = {
    FN: 0,
    N: 0,
    TEL: 0,
    EMAIL: 0,
    ORG: 0,
    TITLE: 0,
    NOTE: 0,
    ADR: 0,
    URL: 0,
    BDAY: 0,
    PHOTO: 0,
    CATEGORIES: 0,
  };
  contacts.forEach((contact) => {
    if (contact.formattedName) fields.FN += 1;
    if (contact.firstName || contact.lastName) fields.N += 1;
    if (contact.phones.length) fields.TEL += 1;
    if (contact.emails.length) fields.EMAIL += 1;
    if (contact.organisation) fields.ORG += 1;
    if (contact.title) fields.TITLE += 1;
    if (contact.note) fields.NOTE += 1;
    if (contact.address) fields.ADR += 1;
    if (contact.url) fields.URL += 1;
    if (contact.birthday) fields.BDAY += 1;
    if (contact.photo) fields.PHOTO += 1;
    if (contact.categories.length) fields.CATEGORIES += 1;
  });
  return Object.entries(fields).map(([field, count]) => ({
    field,
    count,
    percentage: contacts.length
      ? Math.round((count / contacts.length) * 100)
      : 0,
  }));
}

export function contactQuality(contacts: Contact[]) {
  return contacts.map((contact) => {
    const checks = [
      Boolean(contact.formattedName || contact.firstName || contact.lastName),
      contact.phones.length > 0,
      contact.emails.length > 0,
      Boolean(contact.organisation),
      Boolean(contact.note || contact.url || contact.address),
    ];
    return {
      id: contact.id,
      name: contactLabel(contact),
      score: Math.round((checks.filter(Boolean).length / checks.length) * 100),
    };
  });
}

export function findDuplicateValueGroups(
  contacts: Contact[],
  kind: "phone" | "email",
) {
  const buckets = new Map<string, string[]>();
  contacts.forEach((contact) => {
    const values =
      kind === "phone"
        ? contact.phones.map(phoneKey)
        : contact.emails.map((value) => normalizedEmail(value));
    values.filter(Boolean).forEach((value) => {
      const ids = buckets.get(value) ?? [];
      if (!ids.includes(contact.id)) ids.push(contact.id);
      buckets.set(value, ids);
    });
  });
  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({ value, ids }));
}

export function normalizeOrganizations(contacts: Contact[]) {
  return contacts.map((contact) => ({
    ...contact,
    organisation: contact.organisation.trim().replace(/\s+/g, " "),
    department: contact.department?.trim().replace(/\s+/g, " "),
  }));
}
export function cleanNotes(contacts: Contact[]) {
  return contacts.map((contact) => ({
    ...contact,
    note: contact.note
      // eslint-disable-next-line no-control-regex -- Deliberate handling of unsafe control characters.
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  }));
}
export function addCountryCode(contacts: Contact[], countryCode: string) {
  return contacts.map((contact) => ({
    ...contact,
    phones: contact.phones.map((phone) => normalizePhone(phone, countryCode)),
  }));
}
export function removeCountryCode(contacts: Contact[], countryCode: string) {
  const prefix = countryCode.trim().replace(/^\+/, "");
  if (!/^[1-9]\d{0,2}$/.test(prefix)) return contacts;
  return contacts.map((contact) => ({
    ...contact,
    phones: contact.phones.map((phone) => {
      const value = normalizePhone(phone);
      return value.startsWith(`+${prefix}`)
        ? value.slice(prefix.length + 1)
        : phone;
    }),
  }));
}
export function shuffleContacts(contacts: Contact[]) {
  const output = [...contacts];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}
export function groupContactValues(
  contacts: Contact[],
  kind: "company" | "domain",
) {
  const groups = new Map<string, string[]>();
  contacts.forEach((contact) => {
    const values =
      kind === "company"
        ? [contact.organisation.trim() || "(no organisation)"]
        : [
            ...new Set(
              contact.emails
                .map((email) => email.split("@")[1]?.toLowerCase())
                .filter(Boolean),
            ),
          ];
    (values.length ? values : ["(no email domain)"]).forEach((value) =>
      groups.set(value, [...(groups.get(value) ?? []), contact.id]),
    );
  });
  return [...groups.entries()]
    .map(([value, ids]) => ({ value, ids, count: ids.length }))
    .sort((a, b) => b.count - a.count);
}

export function contactsToText(contacts: Contact[]) {
  return (
    contacts
      .map((contact) =>
        [
          contactLabel(contact),
          ...contact.phones.map((phone) => `Phone: ${phone}`),
          ...contact.emails.map((email) => `Email: ${email}`),
          contact.organisation && `Organization: ${contact.organisation}`,
          contact.title && `Title: ${contact.title}`,
          contact.note && `Note: ${contact.note}`,
        ]
          .filter(Boolean)
          .join("\n"),
      )
      .join("\n\n") + (contacts.length ? "\n" : "")
  );
}

export function contactsToHtml(contacts: Contact[]) {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const cards = contacts
    .map(
      (contact) =>
        `<article><h2>${escape(contactLabel(contact))}</h2>${contact.organisation ? `<p>${escape(contact.organisation)}${contact.title ? ` · ${escape(contact.title)}` : ""}</p>` : ""}<ul>${[
          ...contact.phones.map((phone) => `Phone: ${phone}`),
          ...contact.emails.map((email) => `Email: ${email}`),
          contact.url ? `Website: ${contact.url}` : "",
        ]
          .filter(Boolean)
          .map((item) => `<li>${escape(item)}</li>`)
          .join(
            "",
          )}</ul>${contact.note ? `<p>${escape(contact.note)}</p>` : ""}</article>`,
    )
    .join("\n");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Contact directory</title><style>body{font:16px system-ui;max-width:900px;margin:2rem auto;padding:0 1rem}article{border-bottom:1px solid #ddd;padding:1rem 0}h2{margin:.2rem 0}p{color:#555}li{margin:.25rem 0}</style><main>${cards}</main></html>`;
}

export function contactsToTsv(contacts: Contact[], safeMode = true) {
  const headers = [
    "Full Name",
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Organization",
    "Title",
    "Note",
  ];
  const safe = (value: string) => {
    const flat = value.replace(/[\t\r\n]/g, " ");
    return safeMode && /^\s*[=+\-@]/.test(flat) ? `'${flat}` : flat;
  };
  return (
    [
      headers.join("\t"),
      ...contacts.map((contact) =>
        [
          contactLabel(contact),
          contact.firstName,
          contact.lastName,
          contact.phones[0] ?? "",
          contact.emails[0] ?? "",
          contact.organisation,
          contact.title,
          contact.note,
        ]
          .map(safe)
          .join("\t"),
      ),
    ].join("\r\n") + "\r\n"
  );
}

export function contactsToSql(contacts: Contact[]) {
  const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
  const rows = contacts
    .map(
      (contact) =>
        `(${[contactLabel(contact), contact.firstName, contact.lastName, contact.phones.join(", "), contact.emails.join(", "), contact.organisation, contact.title, contact.note].map(quote).join(", ")})`,
    )
    .join(",\n");
  return `CREATE TABLE contacts (full_name TEXT, first_name TEXT, last_name TEXT, phones TEXT, emails TEXT, organisation TEXT, title TEXT, note TEXT);\nINSERT INTO contacts (full_name, first_name, last_name, phones, emails, organisation, title, note) VALUES\n${rows || "('','','','','','','','')"};\n`;
}
