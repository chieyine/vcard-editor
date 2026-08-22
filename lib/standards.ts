import { Contact, parseVCard, serializeVCards } from "./vcard";

export type StandardsFormat = "json" | "jscontact" | "jcard" | "xcard" | "ldif";

const text = (value: unknown) => typeof value === "string" ? value : value == null ? "" : String(value);
const first = (value: unknown) => Array.isArray(value) ? text(value[0]) : text(value);
const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const unescapeXml = (value: string) => value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

function contactCountBucket(count: number) { return count > 1000 ? "1000-plus" : count > 100 ? "101-1000" : "0-100"; }

export function contactsToJSContact(contacts: Contact[]) {
  return contacts.map((contact) => ({
    "@type": "Card",
    uid: contact.uid || contact.id,
    fullName: contact.formattedName,
    name: { components: [{ kind: "surname", value: contact.lastName }, { kind: "given", value: contact.firstName }] },
    phones: Object.fromEntries(contact.phones.map((phone, index) => [`phone-${index + 1}`, { uri: phone.startsWith("tel:") ? phone : `tel:${phone}`, features: ["voice"] }])),
    emails: Object.fromEntries(contact.emails.map((email, index) => [`email-${index + 1}`, { address: email }])),
    ...(contact.organisation ? { organizations: { primary: { name: contact.organisation } } } : {}),
    ...(contact.title ? { titles: { primary: { value: contact.title } } } : {}),
    ...(contact.note ? { notes: { primary: { value: contact.note } } } : {}),
    ...(contact.categories.length ? { categories: contact.categories } : {}),
  }));
}

export function contactsToJSON(contacts: Contact[]) {
  return contacts.map((contact) => ({ id: contact.uid || contact.id, version: contact.version, firstName: contact.firstName, lastName: contact.lastName, formattedName: contact.formattedName, nickname: contact.nickname ?? "", phones: contact.phones, emails: contact.emails, organisation: contact.organisation, department: contact.department ?? "", title: contact.title, role: contact.role ?? "", url: contact.url ?? "", birthday: contact.birthday ?? "", address: contact.address ?? "", note: contact.note, categories: contact.categories }));
}

export function jsonToContacts(input: unknown): Contact[] {
  const records = Array.isArray(input) ? input : [input];
  return records.filter((record): record is Record<string, unknown> => Boolean(record && typeof record === "object")).map((record, index) => {
    const phones = Array.isArray(record.phones) ? record.phones.map(text).filter(Boolean) : record.phone ? [text(record.phone)] : [];
    const emails = Array.isArray(record.emails) ? record.emails.map(text).filter(Boolean) : record.email ? [text(record.email)] : [];
    const firstName = text(record.firstName); const lastName = text(record.lastName); const formattedName = text(record.formattedName) || [firstName, lastName].filter(Boolean).join(" ");
    return { id: text(record.id) || `contact-${index + 1}`, version: "3.0" as const, firstName, lastName, formattedName, nickname: text(record.nickname), phones, emails, organisation: text(record.organisation), department: text(record.department), title: text(record.title), role: text(record.role), url: text(record.url), birthday: text(record.birthday), address: text(record.address), note: text(record.note), uid: text(record.uid) || text(record.id), categories: Array.isArray(record.categories) ? record.categories.map(text) : [], photo: "", rawProperties: [], properties: [], issues: [] };
  });
}

export function jsContactToContacts(input: unknown): Contact[] {
  const cards = Array.isArray(input) ? input : [input];
  return cards.filter((card): card is Record<string, unknown> => Boolean(card && typeof card === "object")).map((card, index) => {
    const name = (card.name && typeof card.name === "object" ? card.name as { components?: unknown[] } : {});
    const components = Array.isArray(name.components) ? name.components : [];
    const component = (kind: string) => first(components.find((item) => item && typeof item === "object" && (item as { kind?: string }).kind === kind) && (components.find((item) => item && typeof item === "object" && (item as { kind?: string }).kind === kind) as { value?: unknown } | undefined)?.value);
    const phones = Object.values(card.phones && typeof card.phones === "object" ? card.phones as Record<string, unknown> : {}).map((phone) => text(phone && typeof phone === "object" ? (phone as { uri?: unknown }).uri : phone).replace(/^tel:/, "")).filter(Boolean);
    const emails = Object.values(card.emails && typeof card.emails === "object" ? card.emails as Record<string, unknown> : {}).map((email) => text(email && typeof email === "object" ? (email as { address?: unknown }).address : email)).filter(Boolean);
    const organisation = first(Object.values(card.organizations && typeof card.organizations === "object" ? card.organizations as Record<string, unknown> : {})[0] && (Object.values(card.organizations as Record<string, unknown>)[0] as { name?: unknown }).name);
    const title = first(Object.values(card.titles && typeof card.titles === "object" ? card.titles as Record<string, unknown> : {})[0] && (Object.values(card.titles as Record<string, unknown>)[0] as { value?: unknown }).value);
    const note = first(Object.values(card.notes && typeof card.notes === "object" ? card.notes as Record<string, unknown> : {})[0] && (Object.values(card.notes as Record<string, unknown>)[0] as { value?: unknown }).value);
    const formattedName = text(card.fullName) || [component("given"), component("surname")].filter(Boolean).join(" ");
    return { id: text(card.uid) || `contact-${index + 1}`, version: "4.0" as const, firstName: component("given"), lastName: component("surname"), formattedName, phones, emails, organisation, title, note, uid: text(card.uid), categories: Array.isArray(card.categories) ? card.categories.map(text) : [], photo: "", rawProperties: [], properties: [], issues: [] };
  });
}

function jCardProperty(name: string, value: string, params: Record<string, string> = {}) {
  const parameterObject = Object.fromEntries(Object.entries(params).map(([key, item]) => [key, ["text", item]]));
  return [name, parameterObject, "text", value];
}

export function contactsToJCard(contacts: Contact[]) {
  return contacts.map((contact) => ["vcard", [jCardProperty("version", "4.0"), jCardProperty("fn", contact.formattedName), jCardProperty("n", [contact.lastName, contact.firstName, "", "", ""].join(";")), ...contact.phones.map((phone) => jCardProperty("tel", phone)), ...contact.emails.map((email) => jCardProperty("email", email)), ...(contact.organisation ? [jCardProperty("org", contact.organisation)] : []), ...(contact.title ? [jCardProperty("title", contact.title)] : []), ...(contact.note ? [jCardProperty("note", contact.note)] : []), ...(contact.uid ? [jCardProperty("uid", contact.uid)] : [])]]);
}

export function jCardToContacts(input: unknown): Contact[] {
  const cards = Array.isArray(input) && input[0] === "vcard" ? [input] : Array.isArray(input) ? input : [];
  return cards.map((card, index) => {
    const properties = Array.isArray(card) && Array.isArray(card[1]) ? card[1] : [];
    const values = (name: string) => properties.filter((property) => Array.isArray(property) && text(property[0]).toLowerCase() === name).map((property) => first(property[3]));
    const n = (values("n")[0] || "").split(";");
    return { id: values("uid")[0] || `contact-${index + 1}`, version: "4.0" as const, firstName: n[1] || "", lastName: n[0] || "", formattedName: values("fn")[0] || [n[1], n[0]].filter(Boolean).join(" "), phones: values("tel"), emails: values("email"), organisation: values("org")[0] || "", title: values("title")[0] || "", note: values("note")[0] || "", uid: values("uid")[0] || "", categories: values("categories"), photo: "", rawProperties: [], properties: [], issues: [] };
  });
}

function xCardContact(contact: Contact) {
  const property = (name: string, value: string) => `<${name}><text>${escapeXml(value)}</text></${name}>`;
  return `<vcard>${property("version", "4.0")}${property("fn", contact.formattedName)}${property("n", [contact.lastName, contact.firstName, "", "", ""].join(";"))}${contact.phones.map((phone) => property("tel", phone)).join("")}${contact.emails.map((email) => property("email", email)).join("")}${contact.organisation ? property("org", contact.organisation) : ""}${contact.title ? property("title", contact.title) : ""}${contact.note ? property("note", contact.note) : ""}${contact.uid ? property("uid", contact.uid) : ""}</vcard>`;
}

export function contactsToXCard(contacts: Contact[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<vcards xmlns="urn:ietf:params:xml:ns:vcard">${contacts.map(xCardContact).join("")}</vcards>`;
}

export function xCardToContacts(input: string) {
  return [...input.matchAll(/<vcard\b[^>]*>([\s\S]*?)<\/vcard>/gi)].map((match, index) => {
    const body = match[1];
    const values = (name: string) => [...body.matchAll(new RegExp(`<${name}[^>]*>[\\s\\S]*?<text>([\\s\\S]*?)<\\/text>[\\s\\S]*?<\\/${name}>`, "gi"))].map((item) => unescapeXml(item[1]));
    const n = (values("n")[0] || "").split(";");
    return { id: values("uid")[0] || `contact-${index + 1}`, version: "4.0" as const, firstName: n[1] || "", lastName: n[0] || "", formattedName: values("fn")[0] || [n[1], n[0]].filter(Boolean).join(" "), phones: values("tel"), emails: values("email"), organisation: values("org")[0] || "", title: values("title")[0] || "", note: values("note")[0] || "", uid: values("uid")[0] || "", categories: [], photo: "", rawProperties: [], properties: [], issues: [] };
  });
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

function fromBase64(value: string) {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function ldifProperty(name: string, value: string) {
  const unsafe = /[^\x20-\x7e]/.test(value) || /^[ :<]/.test(value) || / $/.test(value);
  return unsafe ? `${name}:: ${toBase64(value)}` : `${name}: ${value}`;
}

function foldLdifLine(line: string) {
  if (line.length <= 78) return [line];
  const parts = [line.slice(0, 78)];
  let rest = line.slice(78);
  while (rest.length > 77) { parts.push(` ${rest.slice(0, 77)}`); rest = rest.slice(77); }
  if (rest) parts.push(` ${rest}`);
  return parts;
}

function unfoldLdifEntry(entry: string) {
  return entry.split(/\r\n|\n|\r/).reduce<string[]>((lines, line) => {
    if (/^ /.test(line) && lines.length) lines[lines.length - 1] += line.slice(1);
    else lines.push(line);
    return lines;
  }, []).join("\n");
}

export function contactsToLdif(contacts: Contact[]) {
  return contacts.map((contact) => {
    const fields: [string, string][] = [
      ["dn", `uid=${contact.uid || contact.id},dc=contacts`],
      ["objectClass", "top"],
      ["objectClass", "inetOrgPerson"],
      ["cn", contact.formattedName],
      ["sn", contact.lastName],
      ["givenName", contact.firstName],
      ...contact.phones.map((phone): [string, string] => ["telephoneNumber", phone]),
      ...contact.emails.map((email): [string, string] => ["mail", email]),
    ];
    if (contact.organisation) fields.push(["o", contact.organisation]);
    if (contact.title) fields.push(["title", contact.title]);
    if (contact.note) fields.push(["description", contact.note]);
    return fields.flatMap(([name, value]) => foldLdifLine(ldifProperty(name, value))).join("\n");
  }).join("\n\n");
}

export function ldifToContacts(input: string) {
  return input.split(/\n\s*\n/).map((entry, index) => {
    const unfolded = unfoldLdifEntry(entry);
    const values = (key: string) => [...unfolded.matchAll(new RegExp(`^${key}(::|:)\\s*(.*)$`, "gmi"))].map((match) => match[1] === "::" ? fromBase64(match[2].replace(/\s+/g, "")) : match[2].trim());
    const dnMatch = unfolded.match(/^dn(::|:)\s*(.*)$/im);
    const dn = dnMatch ? (dnMatch[1] === "::" ? fromBase64(dnMatch[2].replace(/\s+/g, "")) : dnMatch[2].trim()) : "";
    const uid = (values("uid")[0] || dn.match(/^uid=([^,]+)/)?.[1] || `contact-${index + 1}`);
    const firstName = values("givenName")[0] || "";
    const lastName = values("sn")[0] || "";
    return { id: uid, version: "3.0" as const, firstName, lastName, formattedName: values("cn")[0] || [firstName, lastName].filter(Boolean).join(" "), phones: values("telephoneNumber"), emails: values("mail"), organisation: values("o")[0] || "", title: values("title")[0] || "", note: values("description")[0] || "", uid, categories: [], photo: "", rawProperties: [], properties: [], issues: [] };
  }).filter((contact) => contact.formattedName || contact.phones.length || contact.emails.length);
}

export function convertStandards(input: string, direction: "from-vcard" | "to-vcard", format: StandardsFormat) {
  if (direction === "from-vcard") {
    const contacts = parseVCard(input).contacts;
    if (format === "json") return JSON.stringify(contactsToJSON(contacts), null, 2);
    if (format === "jscontact") return JSON.stringify(contactsToJSContact(contacts), null, 2);
    if (format === "jcard") return JSON.stringify(contactsToJCard(contacts), null, 2);
    if (format === "xcard") return contactsToXCard(contacts);
    return contactsToLdif(contacts);
  }
  let contacts: Contact[];
  if (format === "json") contacts = jsonToContacts(JSON.parse(input));
  else if (format === "jscontact") contacts = jsContactToContacts(JSON.parse(input));
  else if (format === "jcard") contacts = jCardToContacts(JSON.parse(input));
  else if (format === "xcard") contacts = xCardToContacts(input);
  else contacts = ldifToContacts(input);
  return serializeVCards(contacts, { version: "3.0", preserveUnknown: false, includePhotos: false });
}

export function standardsContactCount(input: string, direction: "from-vcard" | "to-vcard", format: StandardsFormat) {
  if (direction === "from-vcard") return contactCountBucket(parseVCard(input).contacts.length);
  if (format === "xcard") return contactCountBucket(xCardToContacts(input).length);
  if (format === "ldif") return contactCountBucket(ldifToContacts(input).length);
  const parsed = JSON.parse(input);
  if (format === "json") return contactCountBucket(jsonToContacts(parsed).length);
  return contactCountBucket(format === "jcard" ? jCardToContacts(parsed).length : jsContactToContacts(parsed).length);
}
