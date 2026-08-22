import { Contact, KnownVCardVersion, ParseResult, ValidationIssue, parseVCard, serializeVCards } from "./vcard";

export type CleanerOptions = { trimWhitespace: boolean; normalizeEmails: boolean; normalizePhones: boolean; removePhotos: boolean; removeEmpty: boolean; countryCode: string };
export type DuplicateGroup = { ids: string[]; confidence: "high" | "medium"; reason: string };

export function normalizePhone(value: string, countryCode = "") {
  const trimmed = value.trim();
  const extension = trimmed.match(/(?:ext\.?|x)\s*(\d+)$/i)?.[1];
  let digits = trimmed.replace(/(?:ext\.?|x)\s*\d+$/i, "").replace(/\D/g, "");
  const international = trimmed.trimStart().startsWith("+") || trimmed.trimStart().startsWith("00");
  if (trimmed.trimStart().startsWith("00")) digits = digits.slice(2);
  if (!international && countryCode) digits = digits.startsWith("0") ? digits.slice(1) : digits;
  const normal = international ? `+${digits}` : countryCode ? `${countryCode.startsWith("+") ? countryCode : `+${countryCode}`}${digits}` : digits;
  return extension ? `${normal} ext ${extension}` : normal;
}

function normalizedEmail(value: string) { return value.trim().toLowerCase(); }
function contactLabel(contact: Contact) { return contact.formattedName || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || contact.emails[0] || contact.phones[0] || "Unnamed contact"; }

export function findDuplicateGroups(contacts: Contact[]): DuplicateGroup[] {
  const buckets = new Map<string, { ids: string[]; confidence: "high" | "medium"; reason: string }>();
  contacts.forEach((contact) => {
    const keys: [string, "high" | "medium", string][] = [
      ...contact.phones.filter(Boolean).map((phone): [string, "high", string] => [`phone:${normalizePhone(phone)}`, "high", "matching phone number"]),
      ...contact.emails.filter(Boolean).map((email): [string, "high", string] => [`email:${normalizedEmail(email)}`, "high", "matching email address"]),
    ];
    const name = contactLabel(contact).toLowerCase().replace(/\s+/g, " ").trim();
    if (name && name !== "unnamed contact") keys.push([`name:${name}`, "medium", "matching contact name"]);
    keys.forEach(([key, confidence, reason]) => {
      const bucket = buckets.get(key) ?? { ids: [], confidence, reason };
      if (!bucket.ids.includes(contact.id)) bucket.ids.push(contact.id);
      if (confidence === "high") { bucket.confidence = "high"; bucket.reason = reason; }
      buckets.set(key, bucket);
    });
  });
  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();
  [...buckets.values()].filter((bucket) => bucket.ids.length > 1).forEach((bucket) => {
    const ids = [...bucket.ids].sort();
    const signature = ids.join("|");
    if (!seen.has(signature)) { groups.push({ ids, confidence: bucket.confidence, reason: bucket.reason }); seen.add(signature); }
  });
  return groups.sort((a, b) => (a.confidence === "high" ? -1 : 1) - (b.confidence === "high" ? -1 : 1));
}

export function mergeContactGroup(contacts: Contact[], ids: string[], primaryId?: string) {
  const members = contacts.filter((contact) => ids.includes(contact.id));
  if (members.length < 2) return contacts;
  const first = primaryId ? (members.find((member) => member.id === primaryId) ?? members[0]) : members[0];
  const merged: Contact = { ...first, phones: [...first.phones], emails: [...first.emails], categories: [...first.categories], properties: [...first.properties], issues: [...first.issues] };
  members.slice(1).forEach((member) => {
    if (!merged.firstName) merged.firstName = member.firstName;
    if (!merged.lastName) merged.lastName = member.lastName;
    if (!merged.formattedName) merged.formattedName = member.formattedName;
    if (!merged.organisation) merged.organisation = member.organisation;
    if (!merged.title) merged.title = member.title;
    if (!merged.note) merged.note = member.note;
    if (!merged.uid) merged.uid = member.uid;
    merged.phones.push(...member.phones.filter((phone) => !merged.phones.some((existing) => normalizePhone(existing) === normalizePhone(phone))));
    merged.emails.push(...member.emails.filter((email) => !merged.emails.some((existing) => normalizedEmail(existing) === normalizedEmail(email))));
    merged.categories.push(...member.categories.filter((category) => !merged.categories.includes(category)));
    merged.properties.push(...member.properties.filter((property) => !merged.properties.some((existing) => existing.raw === property.raw)));
    merged.issues.push(...member.issues);
  });
  return contacts.filter((contact) => !ids.includes(contact.id) || contact.id === first.id).map((contact) => contact.id === first.id ? merged : contact);
}

export function removeDuplicateGroups(contacts: Contact[], groups: DuplicateGroup[]) {
  const idsToRemove = new Set<string>();
  groups.forEach((group) => group.ids.slice(1).forEach((id) => idsToRemove.add(id)));
  return contacts.filter((contact) => !idsToRemove.has(contact.id));
}

export function cleanContacts(contacts: Contact[], options: CleanerOptions) {
  let changed = 0;
  let next = contacts.map((contact) => {
    const cleaned: Contact = { ...contact, phones: [...contact.phones], emails: [...contact.emails], categories: [...contact.categories] };
    let dirty = false;
    if (options.trimWhitespace) {
      const before = JSON.stringify([cleaned.firstName, cleaned.lastName, cleaned.formattedName, cleaned.organisation, cleaned.title, cleaned.note]);
      cleaned.firstName = cleaned.firstName.trim(); cleaned.lastName = cleaned.lastName.trim(); cleaned.formattedName = cleaned.formattedName.trim(); cleaned.organisation = cleaned.organisation.trim(); cleaned.title = cleaned.title.trim(); cleaned.note = cleaned.note.trim();
      cleaned.phones = cleaned.phones.map((value) => value.trim()); cleaned.emails = cleaned.emails.map((value) => value.trim());
      if (before !== JSON.stringify([cleaned.firstName, cleaned.lastName, cleaned.formattedName, cleaned.organisation, cleaned.title, cleaned.note])) dirty = true;
    }
    if (options.normalizeEmails) { const before = JSON.stringify(cleaned.emails); cleaned.emails = cleaned.emails.map(normalizedEmail); if (before !== JSON.stringify(cleaned.emails)) dirty = true; }
    if (options.normalizePhones) { const before = JSON.stringify(cleaned.phones); cleaned.phones = cleaned.phones.map((phone) => normalizePhone(phone, options.countryCode)); if (before !== JSON.stringify(cleaned.phones)) dirty = true; }
    if (options.removePhotos && cleaned.photo) { cleaned.photo = ""; dirty = true; }
    if (dirty) changed += 1;
    return cleaned;
  });
  if (options.removeEmpty) next = next.filter((contact) => contact.formattedName || contact.firstName || contact.lastName || contact.phones.length || contact.emails.length || contact.organisation);
  return { contacts: next, changed };
}

export function validateContacts(contacts: Contact[], parseResult?: ParseResult, options?: { strict?: boolean }): ValidationIssue[] {
  const strict = options?.strict === true;
  const issues: ValidationIssue[] = parseResult?.issues ? [...parseResult.issues] : [];
  contacts.forEach((contact) => {
    contact.emails.forEach((email) => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push({ code: "INVALID_EMAIL", severity: "warning", message: `${contactLabel(contact)} has an email address with an unusual format.`, property: "EMAIL" }); });
    if (!contact.formattedName && !contact.firstName && !contact.lastName && !contact.phones.length && !contact.emails.length) issues.push({ code: "EMPTY_CONTACT", severity: "warning", message: `${contactLabel(contact)} has no useful contact fields.`, property: "FN" });
    if (contact.version === "unknown") issues.push({ code: "UNKNOWN_VERSION", severity: "warning", message: `${contactLabel(contact)} has an unknown vCard version.`, property: "VERSION" });
    if (strict) {
      if (!contact.formattedName) issues.push({ code: "REQUIRED_FN", severity: "error", message: `${contactLabel(contact)} has no FN property; vCard 3.0 and 4.0 require it.`, property: "FN" });
      if (!contact.firstName && !contact.lastName) issues.push({ code: "MISSING_N", severity: "warning", message: `${contactLabel(contact)} has no structured N name parts.`, property: "N" });
    }
  });
  if (!strict) return issues;
  // Escalate structural violations without mutating the shared issue objects.
  return issues.map((issue) => issue.code === "MISSING_VERSION" || issue.code === "MISSING_FN" ? { ...issue, severity: "error" as const } : issue);
}

export function repairVCardText(text: string, targetVersion: KnownVCardVersion = "3.0") {
  let repaired = text.replace(/^\uFEFF/, "").replace(/\r\n?|\n/g, "\r\n");
  const beginCount = (repaired.match(/BEGIN:VCARD/gi) ?? []).length;
  const endCount = (repaired.match(/END:VCARD/gi) ?? []).length;
  const repairs: string[] = [];
  if (beginCount > endCount) { repaired += `${"\r\nEND:VCARD".repeat(beginCount - endCount)}\r\n`; repairs.push(`Added ${beginCount - endCount} missing END:VCARD marker${beginCount - endCount === 1 ? "" : "s"}.`); }
  if (text.startsWith("\uFEFF")) repairs.push("Removed the byte-order mark before parsing.");
  if (/\r(?!\n)|(?<!\r)\n/.test(text)) repairs.push("normalized mixed line endings to CRLF.");
  const parsed = parseVCard(repaired);
  const output = serializeVCards(parsed.contacts, { version: targetVersion, preserveUnknown: true, includePhotos: true, lineEnding: "CRLF" });
  repairs.push(`Re-serialised ${parsed.contacts.length} contact${parsed.contacts.length === 1 ? "" : "s"} with vCard ${targetVersion}.`);
  return { output, parsed, repairs };
}

export function extractValues(contacts: Contact[], kind: "phones" | "emails") {
  return contacts.flatMap((contact) => contact[kind].filter(Boolean).map((value) => ({ Value: value, Type: kind === "phones" ? "Phone" : "Email", Contact: contactLabel(contact), Organization: contact.organisation })));
}

export type ExtractionKind = "phones" | "emails" | "addresses" | "companies" | "urls" | "birthdays" | "notes" | "extensions" | "photos";

export function extractFieldValues(contacts: Contact[], kind: ExtractionKind) {
  return contacts.flatMap((contact) => {
    const values = kind === "phones" ? contact.phones : kind === "emails" ? contact.emails : kind === "addresses" ? [contact.address ?? ""] : kind === "companies" ? [contact.organisation, contact.department ?? "", contact.title].filter(Boolean) : kind === "urls" ? [contact.url ?? ""] : kind === "birthdays" ? [contact.birthday ?? ""] : kind === "notes" ? [contact.note] : kind === "photos" ? [contact.photo] : contact.properties.filter((property) => property.name.startsWith("X-")).map((property) => `${property.name}: ${property.value}`);
    return values.filter(Boolean).map((value) => ({ Value: value, Type: kind, Contact: contactLabel(contact), Organization: contact.organisation }));
  });
}

export function changeFieldType(contacts: Contact[], kind: "phone" | "email", type: string) { return contacts.map((contact) => kind === "phone" ? { ...contact, phoneTypes: contact.phones.map(() => type) } : { ...contact, emailTypes: contact.emails.map(() => type) }); }

export type ContactFilter = "all" | "has-phone" | "without-phone" | "has-email" | "without-email" | "has-name" | "empty";

export function filterContacts(contacts: Contact[], filter: ContactFilter, query = "") {
  const needle = query.trim().toLowerCase();
  return contacts.filter((contact) => {
    const searchable = `${contactLabel(contact)} ${contact.organisation} ${contact.emails.join(" ")} ${contact.phones.join(" ")} ${contact.note}`.toLowerCase();
    if (needle && !searchable.includes(needle)) return false;
    if (filter === "has-phone") return contact.phones.length > 0;
    if (filter === "without-phone") return contact.phones.length === 0;
    if (filter === "has-email") return contact.emails.length > 0;
    if (filter === "without-email") return contact.emails.length === 0;
    if (filter === "has-name") return Boolean(contact.formattedName || contact.firstName || contact.lastName);
    if (filter === "empty") return !contact.formattedName && !contact.firstName && !contact.lastName && !contact.phones.length && !contact.emails.length && !contact.organisation;
    return true;
  });
}

export function sortContacts(contacts: Contact[], key: "name" | "organisation" | "email" | "phone" | "file-order", direction: "asc" | "desc" = "asc") {
  if (key === "file-order") return direction === "asc" ? [...contacts] : [...contacts].reverse();
  const value = (contact: Contact) => key === "organisation" ? contact.organisation : key === "email" ? contact.emails[0] ?? "" : key === "phone" ? contact.phones[0] ?? "" : contactLabel(contact);
  const multiplier = direction === "asc" ? 1 : -1;
  return [...contacts].sort((a, b) => value(a).localeCompare(value(b), undefined, { sensitivity: "base", numeric: true }) * multiplier);
}

export function removeDuplicateFields(contacts: Contact[]) {
  return contacts.map((contact) => ({
    ...contact,
    phones: contact.phones.filter((phone, index, values) => values.findIndex((item) => normalizePhone(item) === normalizePhone(phone)) === index),
    emails: contact.emails.filter((email, index, values) => values.findIndex((item) => normalizedEmail(item) === normalizedEmail(email)) === index),
    categories: contact.categories.filter((category, index, values) => values.findIndex((item) => item.trim().toLowerCase() === category.trim().toLowerCase()) === index),
  }));
}

export type RedactionOptions = { removeNotes: boolean; removeAddresses: boolean; removeBirthdays: boolean; removePhotos: boolean; removeUrls: boolean };

export function redactContacts(contacts: Contact[], options: RedactionOptions) {
  return contacts.map((contact) => ({ ...contact, note: options.removeNotes ? "" : contact.note, address: options.removeAddresses ? "" : contact.address, birthday: options.removeBirthdays ? "" : contact.birthday, photo: options.removePhotos ? "" : contact.photo, url: options.removeUrls ? "" : contact.url }));
}

export function fieldFrequency(contacts: Contact[]) {
  const fields: Record<string, number> = { FN: 0, N: 0, TEL: 0, EMAIL: 0, ORG: 0, TITLE: 0, NOTE: 0, ADR: 0, URL: 0, BDAY: 0, PHOTO: 0, CATEGORIES: 0 };
  contacts.forEach((contact) => { if (contact.formattedName) fields.FN += 1; if (contact.firstName || contact.lastName) fields.N += 1; if (contact.phones.length) fields.TEL += 1; if (contact.emails.length) fields.EMAIL += 1; if (contact.organisation) fields.ORG += 1; if (contact.title) fields.TITLE += 1; if (contact.note) fields.NOTE += 1; if (contact.address) fields.ADR += 1; if (contact.url) fields.URL += 1; if (contact.birthday) fields.BDAY += 1; if (contact.photo) fields.PHOTO += 1; if (contact.categories.length) fields.CATEGORIES += 1; });
  return Object.entries(fields).map(([field, count]) => ({ field, count, percentage: contacts.length ? Math.round((count / contacts.length) * 100) : 0 }));
}

export function contactQuality(contacts: Contact[]) {
  return contacts.map((contact) => { const checks = [Boolean(contact.formattedName || contact.firstName || contact.lastName), contact.phones.length > 0, contact.emails.length > 0, Boolean(contact.organisation), Boolean(contact.note || contact.url || contact.address)]; return { id: contact.id, name: contactLabel(contact), score: Math.round((checks.filter(Boolean).length / checks.length) * 100) }; });
}

export function findDuplicateValueGroups(contacts: Contact[], kind: "phone" | "email") {
  const buckets = new Map<string, string[]>();
  contacts.forEach((contact) => { const values = kind === "phone" ? contact.phones.map((value) => normalizePhone(value)) : contact.emails.map((value) => normalizedEmail(value)); values.filter(Boolean).forEach((value) => { const ids = buckets.get(value) ?? []; if (!ids.includes(contact.id)) ids.push(contact.id); buckets.set(value, ids); }); });
  return [...buckets.entries()].filter(([, ids]) => ids.length > 1).map(([value, ids]) => ({ value, ids }));
}

export function normalizeOrganizations(contacts: Contact[]) { return contacts.map((contact) => ({ ...contact, organisation: contact.organisation.trim().replace(/\s+/g, " "), department: contact.department?.trim().replace(/\s+/g, " ") })); }
export function cleanNotes(contacts: Contact[]) { return contacts.map((contact) => ({ ...contact, note: contact.note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/\s+/g, " ").trim() })); }
export function addCountryCode(contacts: Contact[], countryCode: string) { return contacts.map((contact) => ({ ...contact, phones: contact.phones.map((phone) => normalizePhone(phone, countryCode)) })); }
export function removeCountryCode(contacts: Contact[], countryCode: string) { const prefix = countryCode.replace(/\D/g, ""); if (!prefix) return contacts; return contacts.map((contact) => ({ ...contact, phones: contact.phones.map((phone) => { const value = phone.trim(); const digits = value.replace(/\D/g, ""); return digits.startsWith(prefix) ? digits.slice(prefix.length).replace(/^/, "0") : value; }) })); }
export function shuffleContacts(contacts: Contact[]) { const output = [...contacts]; for (let index = output.length - 1; index > 0; index -= 1) { const swap = Math.floor(Math.random() * (index + 1)); [output[index], output[swap]] = [output[swap], output[index]]; } return output; }
export function groupContactValues(contacts: Contact[], kind: "company" | "domain") { const groups = new Map<string, string[]>(); contacts.forEach((contact) => { const values = kind === "company" ? [contact.organisation.trim() || "(no organisation)"] : [...new Set(contact.emails.map((email) => email.split("@")[1]?.toLowerCase()).filter(Boolean))]; (values.length ? values : ["(no email domain)"]).forEach((value) => groups.set(value, [...(groups.get(value) ?? []), contact.id])); }); return [...groups.entries()].map(([value, ids]) => ({ value, ids, count: ids.length })).sort((a, b) => b.count - a.count); }

export function contactsToText(contacts: Contact[]) {
  return contacts.map((contact) => [contactLabel(contact), ...contact.phones.map((phone) => `Phone: ${phone}`), ...contact.emails.map((email) => `Email: ${email}`), contact.organisation && `Organization: ${contact.organisation}`, contact.title && `Title: ${contact.title}`, contact.note && `Note: ${contact.note}`].filter(Boolean).join("\n")).join("\n\n") + (contacts.length ? "\n" : "");
}

export function contactsToHtml(contacts: Contact[]) {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const cards = contacts.map((contact) => `<article><h2>${escape(contactLabel(contact))}</h2>${contact.organisation ? `<p>${escape(contact.organisation)}${contact.title ? ` · ${escape(contact.title)}` : ""}</p>` : ""}<ul>${[...contact.phones.map((phone) => `Phone: ${phone}`), ...contact.emails.map((email) => `Email: ${email}`), contact.url ? `Website: ${contact.url}` : ""].filter(Boolean).map((item) => `<li>${escape(item)}</li>`).join("")}</ul>${contact.note ? `<p>${escape(contact.note)}</p>` : ""}</article>`).join("\n");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Contact directory</title><style>body{font:16px system-ui;max-width:900px;margin:2rem auto;padding:0 1rem}article{border-bottom:1px solid #ddd;padding:1rem 0}h2{margin:.2rem 0}p{color:#555}li{margin:.25rem 0}</style><main>${cards}</main></html>`;
}

export function contactsToTsv(contacts: Contact[]) {
  const headers = ["Full Name", "First Name", "Last Name", "Phone", "Email", "Organization", "Title", "Note"];
  const safe = (value: string) => value.replace(/[\t\r\n]/g, " ");
  return [headers.join("\t"), ...contacts.map((contact) => [contactLabel(contact), contact.firstName, contact.lastName, contact.phones[0] ?? "", contact.emails[0] ?? "", contact.organisation, contact.title, contact.note].map(safe).join("\t"))].join("\r\n") + "\r\n";
}

export function contactsToSql(contacts: Contact[]) {
  const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
  const rows = contacts.map((contact) => `(${[contactLabel(contact), contact.firstName, contact.lastName, contact.phones.join(", "), contact.emails.join(", "), contact.organisation, contact.title, contact.note].map(quote).join(", ")})`).join(",\n");
  return `CREATE TABLE contacts (full_name TEXT, first_name TEXT, last_name TEXT, phones TEXT, emails TEXT, organisation TEXT, title TEXT, note TEXT);\nINSERT INTO contacts (full_name, first_name, last_name, phones, emails, organisation, title, note) VALUES\n${rows || "('','','','','','','','')"};\n`;
}
