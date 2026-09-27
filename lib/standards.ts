import { parseXml, childElements, type Element } from "./xml";
import {
  Contact,
  contactProperties,
  escapeValue,
  parseVCard,
  propertyLine,
  serializeVCard,
  serializeVCards,
  splitEscaped,
  unescapeValue,
  type VCardProperty,
} from "./vcard";
import { assertTextBudget } from "./file-guard";

export type StandardsFormat = "json" | "jscontact" | "jcard" | "xcard" | "ldif";
const text = (value: unknown) => (typeof value === "string" ? value : "");
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const records = (value: unknown) => Object.values(record(value)).map(record);
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
function contactCountBucket(count: number) {
  return count > 1000 ? "1000-plus" : count > 100 ? "101-1000" : "0-100";
}
function limitedRecords(input: unknown) {
  const items = Array.isArray(input) ? input : [input];
  if (items.length > 10000)
    throw new Error("Convert at most 10,000 records at a time.");
  if (!items.length || items.some((item) => !item || typeof item !== "object"))
    throw new Error("Expected contact objects.");
  return items.map(record);
}

export function contactsToJSON(contacts: Contact[]) {
  return contacts.map((contact) => ({
    uid: contact.uid,
    version: contact.version,
    firstName: contact.firstName,
    lastName: contact.lastName,
    formattedName: contact.formattedName,
    nickname: contact.nickname ?? "",
    phones: contact.phones,
    emails: contact.emails,
    organisation: contact.organisation,
    department: contact.department ?? "",
    title: contact.title,
    role: contact.role ?? "",
    url: contact.url ?? "",
    birthday: contact.birthday ?? "",
    address: contact.address ?? "",
    note: contact.note,
    categories: contact.categories,
  }));
}
export function jsonToContacts(input: unknown): Contact[] {
  return limitedRecords(input).map((item, index) => {
    const list = (key: string) =>
      Array.isArray(item[key]) ? item[key].map(text).filter(Boolean) : [];
    const firstName = text(item.firstName);
    const lastName = text(item.lastName);
    return {
      id: `contact-${index + 1}`,
      version: "3.0",
      firstName,
      lastName,
      formattedName:
        text(item.formattedName) ||
        [firstName, lastName].filter(Boolean).join(" "),
      nickname: text(item.nickname),
      phones: list("phones"),
      emails: list("emails"),
      organisation: text(item.organisation),
      department: text(item.department),
      title: text(item.title),
      role: text(item.role),
      url: text(item.url),
      birthday: text(item.birthday),
      address: text(item.address),
      note: text(item.note),
      uid: text(item.uid),
      categories: list("categories"),
      photo: "",
      rawProperties: [],
      properties: [],
      issues: [],
    };
  });
}

export function contactsToJSContact(contacts: Contact[]) {
  return contacts.map((contact) => ({
    "@type": "Card",
    version: "1.0",
    uid: contact.uid || crypto.randomUUID(),
    name: {
      full: contact.formattedName,
      components: [
        { kind: "surname", value: contact.lastName },
        { kind: "given", value: contact.firstName },
      ].filter((part) => part.value),
    },
    ...(contact.phones.length
      ? {
          phones: Object.fromEntries(
            contact.phones.map((phone, index) => [
              `p${index + 1}`,
              { number: phone, features: { voice: true } },
            ]),
          ),
        }
      : {}),
    ...(contact.emails.length
      ? {
          emails: Object.fromEntries(
            contact.emails.map((email, index) => [
              `e${index + 1}`,
              { address: email },
            ]),
          ),
        }
      : {}),
    ...(contact.organisation
      ? { organizations: { primary: { name: contact.organisation } } }
      : {}),
    ...(contact.title
      ? { titles: { primary: { kind: "title", name: contact.title } } }
      : {}),
    ...(contact.note ? { notes: { primary: { note: contact.note } } } : {}),
    ...(contact.categories.length
      ? {
          keywords: Object.fromEntries(
            contact.categories.map((value) => [value, true]),
          ),
        }
      : {}),
  }));
}
export function jsContactToContacts(input: unknown): Contact[] {
  return limitedRecords(input).map((card, index) => {
    if (card["@type"] !== "Card" || card.version !== "1.0" || !text(card.uid))
      throw new Error(
        "This converter accepts JSContact 1.0 Card objects with a uid.",
      );
    const name = record(card.name);
    const components = Array.isArray(name.components)
      ? name.components.map(record)
      : [];
    const component = (kind: string) =>
      components
        .filter((part) => part.kind === kind)
        .map((part) => text(part.value))
        .join(" ");
    const values = (key: string, field: string) =>
      records(card[key])
        .map((item) => text(item[field]))
        .filter(Boolean);
    return jsonToContacts([
      {
        uid: card.uid,
        firstName: component("given"),
        lastName: component("surname"),
        formattedName: text(name.full),
        phones: values("phones", "number"),
        emails: values("emails", "address"),
        organisation: values("organizations", "name")[0] ?? "",
        title: values("titles", "name")[0] ?? "",
        note: values("notes", "note").join("\n"),
        categories: Object.entries(record(card.keywords))
          .filter(([, value]) => value === true)
          .map(([key]) => key),
      },
    ]).map((contact) => ({
      ...contact,
      id: `contact-${index + 1}`,
      version: "4.0" as const,
    }))[0];
  });
}

type JProperty = [
  string,
  Record<string, string | string[]>,
  string,
  ...unknown[],
];
const structuredNames = new Set(["n", "adr", "org"]);
const listNames = new Set(["categories", "nickname"]);
const supportedNames = new Set([
  "fn",
  "n",
  "adr",
  "org",
  "tel",
  "email",
  "title",
  "note",
  "uid",
  "categories",
  "nickname",
  "role",
  "url",
  "bday",
  "photo",
  "prodid",
]);
// RFC 7095 uses extended dates; vCard and xCard use basic dates.
function extendedDate(value: string) {
  return value
    .replace(/^(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
    .replace(/^--(\d{2})(\d{2})/, "--$1-$2")
    .replace(
      /T(\d{2})(\d{2})(\d{2})?/,
      (_, hour: string, minute: string, second?: string) =>
        `T${hour}:${minute}${second ? `:${second}` : ""}`,
    )
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
}
function basicDate(value: string) {
  return value
    .replace(/^(\d{4})-(\d{2})-(\d{2})/, "$1$2$3")
    .replace(/^--(\d{2})-(\d{2})/, "--$1$2")
    .replace(/:/g, "");
}
const isUri = (value: string) => /^[a-z][a-z0-9+.-]*:[^\s]*$/i.test(value);
function toJProperty(p: VCardProperty): JProperty {
  const name = p.name.toLowerCase();
  let type =
    p.params.VALUE?.[0]?.toLowerCase() ||
    (["url", "photo", "uid", "tel"].includes(name)
      ? "uri"
      : name === "bday"
        ? "date-and-or-time"
        : "text");
  if ((name === "uid" || name === "tel") && !isUri(p.value)) type = "text";
  const params: JProperty[1] = Object.fromEntries(
    Object.entries(p.params)
      .filter(([key]) => !["VALUE", "ENCODING", "CHARSET"].includes(key))
      .map(([key, values]) => [
        key.toLowerCase(),
        values.length > 1 ? values : values[0],
      ]),
  );
  if (p.group) params.group = p.group;
  if (structuredNames.has(name)) {
    const parts = splitEscaped(p.rawValue, ";");
    while (parts.length < (name === "n" ? 5 : name === "adr" ? 7 : 1))
      parts.push("");
    const components = parts.map((part) => {
      const values = splitEscaped(part, ",").map(unescapeValue);
      return values.length === 1 ? values[0] : values;
    });
    return [
      name,
      params,
      type,
      name === "org" && components.length === 1 ? components[0] : components,
    ];
  }
  if (listNames.has(name))
    return [
      name,
      params,
      type,
      ...splitEscaped(p.rawValue, ",").map(unescapeValue),
    ];
  return [
    name,
    params,
    type,
    type === "text"
      ? p.value
      : type.includes("date")
        ? extendedDate(p.rawValue)
        : p.rawValue,
  ];
}
export function contactsToJCard(contacts: Contact[]) {
  return contacts.map((contact) => {
    const normalized = parseVCard(
      serializeVCard(
        {
          ...contact,
          forceProperties: [...(contact.forceProperties ?? []), "FN"],
        },
        "4.0",
      ),
    ).contacts[0];
    return [
      "vcard",
      [
        ["version", {}, "text", "4.0"],
        ...contactProperties(normalized)
          .filter((p) => supportedNames.has(p.name.toLowerCase()))
          .map(toJProperty),
      ],
    ];
  });
}
function jPropertyLine(input: unknown) {
  if (!Array.isArray(input) || input.length < 4)
    throw new Error("Invalid jCard property array.");
  const [nameValue, parameters, valueType, ...values] = input;
  const name = text(nameValue).toUpperCase();
  const type = text(valueType);
  if (!/^[A-Z0-9-]+$/.test(name) || !/^[a-z-]+$/.test(type))
    throw new Error("Invalid jCard property name or value type.");
  if (name === "VERSION") {
    if (values[0] !== "4.0") throw new Error("jCard requires version 4.0.");
    return "VERSION:4.0";
  }
  if (!supportedNames.has(name.toLowerCase()))
    throw new Error(`Unsupported property: ${name}. Keep the source file.`);
  const params: Record<string, string[]> = {};
  let group: string | undefined;
  for (const [key, value] of Object.entries(record(parameters))) {
    if (key === "group") {
      group = text(value);
      if (!/^[A-Za-z0-9-]+$/.test(group))
        throw new Error("Invalid property group.");
      continue;
    }
    if (!/^[a-z0-9-]+$/i.test(key))
      throw new Error("Invalid property parameter.");
    params[key.toUpperCase()] = (Array.isArray(value) ? value : [value]).map(
      (item) => String(item),
    );
  }
  const defaultType = ["URL", "PHOTO", "UID", "TEL"].includes(name)
    ? "uri"
    : name === "BDAY"
      ? "date-and-or-time"
      : "text";
  if (type !== defaultType) params.VALUE = [type];
  const scalar = (value: unknown) => {
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean"
    )
      throw new Error("Unsupported property value.");
    return String(value);
  };
  const rawValue =
    structuredNames.has(name.toLowerCase()) &&
    (name !== "ORG" || Array.isArray(values[0]))
      ? (() => {
          if (!Array.isArray(values[0]))
            throw new Error(`${name} must use structured components.`);
          return values[0]
            .map((part: unknown) =>
              (Array.isArray(part) ? part : [part])
                .map((v) => escapeValue(scalar(v)))
                .join(","),
            )
            .join(";");
        })()
      : values
          .map((value) =>
            type === "text"
              ? escapeValue(scalar(value))
              : (type.includes("date")
                  ? basicDate(scalar(value))
                  : scalar(value)
                ).replace(/[\r\n]/g, ""),
          )
          .join(",");
  return propertyLine({
    name,
    group,
    params,
    rawValue,
    value: "",
    raw: "",
    line: 0,
  });
}
export function jCardToContacts(input: unknown): Contact[] {
  const cards = Array.isArray(input) && input[0] === "vcard" ? [input] : input;
  if (!Array.isArray(cards) || !cards.length || cards.length > 10000)
    throw new Error("Expected up to 10,000 jCard arrays.");
  return cards.flatMap((card, index) => {
    if (!Array.isArray(card) || card[0] !== "vcard" || !Array.isArray(card[1]))
      throw new Error("Invalid jCard document.");
    const properties = card[1].map(jPropertyLine);
    if (!properties.includes("VERSION:4.0"))
      throw new Error("jCard requires version 4.0.");
    return parseVCard(
      ["BEGIN:VCARD", ...properties, "END:VCARD"].join("\r\n"),
    ).contacts.map((contact) => ({ ...contact, id: `contact-${index + 1}` }));
  });
}

const XML_NAMESPACE = "urn:ietf:params:xml:ns:vcard-4.0";
const componentTags: Record<string, string[]> = {
  n: ["surname", "given", "additional", "prefix", "suffix"],
  adr: ["pobox", "ext", "street", "locality", "region", "code", "country"],
};
function xmlProperty(property: JProperty) {
  const [name, params, type, ...values] = property;
  if (name === "version" || (name === "uid" && type !== "uri")) return ""; // xCard's namespace supplies the version.
  const tag = (key: string, value: unknown) =>
    `<${key}>${escapeXml(String(value))}</${key}>`;
  const parameters = Object.entries(params)
    .filter(([key]) => key !== "group")
    .map(([key, value]) => {
      const parameterType =
        key === "pref"
          ? "integer"
          : key === "language"
            ? "language-tag"
            : key === "geo"
              ? "uri"
              : [
                    "type",
                    "altid",
                    "pid",
                    "mediatype",
                    "calscale",
                    "sort-as",
                    "label",
                    "tz",
                  ].includes(key)
                ? "text"
                : "unknown";
      const items = (Array.isArray(value) ? value : [value])
        .map((item) =>
          tag(parameterType, key === "type" ? item.toLowerCase() : item),
        )
        .join("");
      return `<${key}>${items}</${key}>`;
    })
    .join("");
  let content: string;
  if (componentTags[name])
    content = componentTags[name]
      .map((key, index) => {
        const part = (values[0] as unknown[])[index] ?? "";
        return (Array.isArray(part) ? part : [part])
          .map((value) => tag(key, value))
          .join("");
      })
      .join("");
  else
    content = values
      .flat(2)
      .map((value) => {
        if (!type.includes("date")) return tag(type, value);
        const basic = basicDate(String(value));
        const kind = basic.startsWith("T")
          ? "time"
          : basic.includes("T")
            ? "date-time"
            : "date";
        return tag(kind, kind === "time" ? basic.slice(1) : basic);
      })
      .join("");
  const result = `<${name}>${parameters ? `<parameters>${parameters}</parameters>` : ""}${content}</${name}>`;
  return params.group
    ? `<group name="${escapeXml(String(params.group))}">${result}</group>`
    : result;
}
export function contactsToXCard(contacts: Contact[]) {
  const cards = contactsToJCard(contacts);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<vcards xmlns="${XML_NAMESPACE}">${cards.map((card) => `<vcard>${(card[1] as JProperty[]).map(xmlProperty).join("")}</vcard>`).join("")}</vcards>`;
}
export function xCardToContacts(input: string) {
  if (/<!DOCTYPE|<!ENTITY/i.test(input))
    throw new Error("XML document types and entities are unsupported.");
  const document = parseXml(input);
  if (
    !document.documentElement ||
    document.documentElement.namespaceURI !== XML_NAMESPACE ||
    document.documentElement!.localName !== "vcards" ||
    Array.from(document.getElementsByTagName("*")).some(
      (element) => element.namespaceURI !== XML_NAMESPACE,
    )
  )
    throw new Error("Expected xCard XML in the vCard 4.0 namespace.");
  const cards = childElements(document.documentElement!).map((card) => {
    if (card.localName !== "vcard")
      throw new Error("Unexpected xCard element.");
    const properties: JProperty[] = [["version", {}, "text", "4.0"]];
    const add = (element: Element, group?: string) => {
      const name = element.localName;
      if (!name) throw new Error("An xCard property has no name.");
      const params: JProperty[1] = group ? { group } : {};
      const values = childElements(element).filter(
        (child) => child.localName !== "parameters",
      );
      const parameterElement = childElements(element).find(
        (child) => child.localName === "parameters",
      );
      for (const parameter of childElements(parameterElement)) {
        const items = childElements(parameter).map(
          (child) => child.textContent ?? "",
        );
        const parameterName = parameter.localName;
        if (!parameterName) throw new Error("An xCard parameter has no name.");
        params[parameterName] = items.length > 1 ? items : items[0];
      }
      const type =
        componentTags[name] || name === "org"
          ? "text"
          : (values[0]?.localName ?? "text");
      if (componentTags[name])
        properties.push([
          name,
          params,
          type,
          componentTags[name].map((tag) => {
            const items = values
              .filter((child) => child.localName === tag)
              .map((child) => child.textContent ?? "");
            return items.length > 1 ? items : (items[0] ?? "");
          }),
        ]);
      else if (name === "org")
        properties.push([
          name,
          params,
          type,
          values.map((child) => child.textContent ?? ""),
        ]);
      else
        properties.push([
          name,
          params,
          name === "bday" && type !== "text" ? "date-and-or-time" : type,
          ...values.map(
            (child) =>
              `${name === "bday" && type === "time" ? "T" : ""}${child.textContent ?? ""}`,
          ),
        ]);
    };
    for (const child of childElements(card)) {
      if (child.localName === "group")
        for (const property of childElements(child))
          add(property, child.getAttribute("name") ?? undefined);
      else add(child);
    }
    return ["vcard", properties];
  });
  return jCardToContacts(cards);
}

export function standardsWarnings(
  input: string,
  direction: "from-vcard" | "to-vcard",
  format: StandardsFormat,
) {
  const warnings = [
    "Beta converter: review the result. Keep the original file; destination compatibility has not been verified.",
  ];
  if (format === "jcard" || format === "jscontact")
    warnings.push(
      "Batch JSON is an array of contact documents. For a single-document API, use one array item.",
    );
  assertTextBudget(input, 5 * 1024 * 1024);
  if (direction === "from-vcard") {
    const contacts = parseVCard(input).contacts;
    if (contacts.length > 10000)
      throw new Error("Convert at most 10,000 contacts at a time.");
    const supported =
      format === "jcard" || format === "xcard"
        ? supportedNames
        : format === "json"
          ? new Set(
              [...supportedNames].filter(
                (name) => !["photo", "prodid"].includes(name),
              ),
            )
          : new Set([
              "fn",
              "n",
              "tel",
              "email",
              "org",
              "title",
              "note",
              "uid",
              ...(format === "jscontact" ? ["categories"] : []),
            ]);
    const omitted = [
      ...new Set(
        contacts
          .flatMap(contactProperties)
          .filter((p) => !supported.has(p.name.toLowerCase()))
          .map((p) => p.name),
      ),
    ];
    if (omitted.length)
      warnings.push(`Unsupported fields omitted: ${omitted.join(", ")}.`);
    if (["json", "jscontact", "ldif"].includes(format))
      warnings.push(
        "This export uses the displayed field subset. Extra name components, repeated scalar fields, groups and property parameters are not represented.",
      );
    if (
      format === "xcard" &&
      contacts.some((contact) => contact.uid && !isUri(contact.uid))
    )
      warnings.push(
        "Non-URI UIDs are omitted from xCard; its UID element requires a URI.",
      );
    if (format === "jscontact" && contacts.some((contact) => !contact.uid))
      warnings.push(
        "New unique identifiers are generated for contacts without a UID, as required by JSContact.",
      );
  } else if (["json", "jscontact", "ldif"].includes(format))
    warnings.push(
      "Only the documented subset is imported: names, phones, emails, first organization/title, notes and categories where supported. Other source attributes and parameters are not imported.",
    );
  return warnings;
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

function fromBase64(value: string) {
  const bytes = Uint8Array.from(atob(value), (character) =>
    character.charCodeAt(0),
  );
  return new TextDecoder().decode(bytes);
}

function escapeDn(value: string) {
  return (
    value
      .replace(/\\/g, "\\\\")
      // eslint-disable-next-line no-control-regex -- Deliberate handling of unsafe control characters.
      .replace(/[,+=<>;"\x00]/g, (character) =>
        character === "\0" ? "\\00" : `\\${character}`,
      )
      .replace(/^ | $|^#/g, (character) => `\\${character}`)
  );
}

function ldifProperty(name: string, value: string) {
  const unsafe =
    /[^\x20-\x7e]/.test(value) || /^[ :<]/.test(value) || / $/.test(value);
  return unsafe ? `${name}:: ${toBase64(value)}` : `${name}: ${value}`;
}

function foldLdifLine(line: string) {
  if (line.length <= 78) return [line];
  const parts = [line.slice(0, 78)];
  let rest = line.slice(78);
  while (rest.length > 77) {
    parts.push(` ${rest.slice(0, 77)}`);
    rest = rest.slice(77);
  }
  if (rest) parts.push(` ${rest}`);
  return parts;
}

function unfoldLdifEntry(entry: string) {
  return entry
    .split(/\r\n|\n|\r/)
    .reduce<string[]>((lines, line) => {
      if (/^ /.test(line) && lines.length)
        lines[lines.length - 1] += line.slice(1);
      else lines.push(line);
      return lines;
    }, [])
    .join("\n");
}

export function contactsToLdif(contacts: Contact[]) {
  return contacts
    .map((contact) => {
      const fields: [string, string][] = [
        [
          "dn",
          `uid=${escapeDn(contact.uid || crypto.randomUUID())},dc=contacts`,
        ],
        ["objectClass", "top"],
        ["objectClass", "inetOrgPerson"],
        [
          "cn",
          contact.formattedName ||
            [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
            "Unnamed",
        ],
        ["sn", contact.lastName || contact.formattedName || "Unnamed"],
        ["givenName", contact.firstName],
        ...contact.phones.map((phone): [string, string] => [
          "telephoneNumber",
          phone,
        ]),
        ...contact.emails.map((email): [string, string] => ["mail", email]),
      ];
      if (contact.organisation) fields.push(["o", contact.organisation]);
      if (contact.title) fields.push(["title", contact.title]);
      if (contact.note) fields.push(["description", contact.note]);
      return fields
        .flatMap(([name, value]) => foldLdifLine(ldifProperty(name, value)))
        .join("\n");
    })
    .join("\n\n");
}

export function ldifToContacts(input: string) {
  const entries = input.replace(/\r\n|\r/g, "\n").split(/\n\s*\n/);
  if (entries.length > 10000)
    throw new Error("Import at most 10,000 LDIF entries at a time.");
  return entries
    .map((entry, index) => {
      const unfolded = unfoldLdifEntry(entry);
      const values = (key: string) =>
        [...unfolded.matchAll(new RegExp(`^${key}(::|:)\\s*(.*)$`, "gmi"))].map(
          (match) =>
            match[1] === "::"
              ? fromBase64(match[2].replace(/\s+/g, ""))
              : match[2].trim(),
        );
      const dnMatch = unfolded.match(/^dn(::|:)\s*(.*)$/im);
      const dn = dnMatch
        ? dnMatch[1] === "::"
          ? fromBase64(dnMatch[2].replace(/\s+/g, ""))
          : dnMatch[2].trim()
        : "";
      const escapedUid = dn.match(/^uid=((?:\\.|[^,])+)/i)?.[1] ?? "";
      const dnUid = escapedUid
        .replace(/(?:\\[a-f0-9]{2})+/gi, (sequence) =>
          new TextDecoder().decode(
            Uint8Array.from(sequence.match(/[a-f0-9]{2}/gi) ?? [], (hex) =>
              Number.parseInt(hex, 16),
            ),
          ),
        )
        .replace(/\\(.)/g, "$1");
      const uid = values("uid")[0] || dnUid;
      const firstName = values("givenName")[0] || "";
      const lastName = values("sn")[0] || "";
      return {
        id: `contact-${index + 1}`,
        version: "3.0" as const,
        firstName,
        lastName,
        formattedName:
          values("cn")[0] || [firstName, lastName].filter(Boolean).join(" "),
        phones: values("telephoneNumber"),
        emails: values("mail"),
        organisation: values("o")[0] || "",
        title: values("title")[0] || "",
        note: values("description")[0] || "",
        uid,
        categories: [],
        photo: "",
        rawProperties: [],
        properties: [],
        issues: [],
      };
    })
    .filter(
      (contact) =>
        contact.formattedName || contact.phones.length || contact.emails.length,
    );
}

export function convertStandards(
  input: string,
  direction: "from-vcard" | "to-vcard",
  format: StandardsFormat,
) {
  assertTextBudget(input, 5 * 1024 * 1024);
  if (direction === "from-vcard") {
    const contacts = parseVCard(input).contacts;
    if (contacts.length > 10000)
      throw new Error("Convert at most 10,000 contacts at a time.");
    if (format === "json")
      return JSON.stringify(contactsToJSON(contacts), null, 2);
    if (format === "jscontact")
      return JSON.stringify(contactsToJSContact(contacts), null, 2);
    if (format === "jcard")
      return JSON.stringify(contactsToJCard(contacts), null, 2);
    if (format === "xcard") return contactsToXCard(contacts);
    return contactsToLdif(contacts);
  }
  let contacts: Contact[];
  if (format === "json") contacts = jsonToContacts(JSON.parse(input));
  else if (format === "jscontact")
    contacts = jsContactToContacts(JSON.parse(input));
  else if (format === "jcard") contacts = jCardToContacts(JSON.parse(input));
  else if (format === "xcard") contacts = xCardToContacts(input);
  else contacts = ldifToContacts(input);
  return serializeVCards(contacts, {
    preserveUnknown: true,
    includePhotos: true,
  });
}

export function standardsContactCount(
  input: string,
  direction: "from-vcard" | "to-vcard",
  format: StandardsFormat,
) {
  if (direction === "from-vcard")
    return contactCountBucket(parseVCard(input).contacts.length);
  if (format === "xcard")
    return contactCountBucket(xCardToContacts(input).length);
  if (format === "ldif")
    return contactCountBucket(ldifToContacts(input).length);
  const parsed = JSON.parse(input);
  if (format === "json")
    return contactCountBucket(jsonToContacts(parsed).length);
  return contactCountBucket(
    format === "jcard"
      ? jCardToContacts(parsed).length
      : jsContactToContacts(parsed).length,
  );
}
