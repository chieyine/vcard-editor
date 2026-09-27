import { contactProperties, type Contact } from "./vcard";
import { phoneKey } from "./contact-tools";

const label = (contact: Contact) => contact.formattedName || "Unnamed contact";
function identity(contact: Contact) {
  if (contact.uid) return `uid:${contact.uid}`;
  const emails = [...contact.emails].map((v) => v.trim().toLowerCase()).sort();
  const phones = contact.phones.map(phoneKey).filter(Boolean).sort();
  if (emails.length) return `email:${emails.join("|")}`;
  if (phones.length) return `phone:${phones.join("|")}`;
  return `name:${contact.formattedName.normalize("NFC").trim().toLowerCase()}`;
}
function values(contact: Contact) {
  return contactProperties(contact)
    .map((p) =>
      JSON.stringify([
        p.group ?? "",
        p.name,
        Object.entries(p.params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => [key, [...value].sort()]),
        p.rawValue,
      ]),
    )
    .sort();
}
export function compareContacts(before: Contact[], after: Contact[]) {
  const buckets = (contacts: Contact[]) => {
    const result = new Map<string, Contact[]>();
    for (const contact of contacts) {
      const key = identity(contact);
      const bucket = result.get(key) ?? [];
      bucket.push(contact);
      result.set(key, bucket);
    }
    return result;
  };
  const left = buckets(before);
  const right = buckets(after);
  const added: Contact[] = [];
  const removed: Contact[] = [];
  const changed: { before: Contact; after: Contact; fields: string[] }[] = [];
  const ambiguous: { label: string; before: number; after: number }[] = [];
  let unchanged = 0;
  for (const key of new Set([...left.keys(), ...right.keys()])) {
    const a: Contact[] = [];
    const remaining = new Map<string, Contact[]>();
    for (const contact of right.get(key) ?? []) {
      const fingerprint = JSON.stringify(values(contact));
      const bucket = remaining.get(fingerprint) ?? [];
      bucket.push(contact);
      remaining.set(fingerprint, bucket);
    }
    // Match identical occurrences first, preserving duplicate multiplicity.
    for (const contact of left.get(key) ?? []) {
      const bucket = remaining.get(JSON.stringify(values(contact)));
      if (bucket?.length) {
        bucket.pop();
        unchanged += 1;
      } else a.push(contact);
    }
    const b = [...remaining.values()].flat();
    if (a.length === 1 && b.length === 1) {
      const fields = [
        ...new Set(
          [...contactProperties(a[0]), ...contactProperties(b[0])].map(
            (p) => p.name,
          ),
        ),
      ].filter(
        (name) =>
          JSON.stringify(
            contactProperties(a[0])
              .filter((p) => p.name === name)
              .map((p) => p.raw)
              .sort(),
          ) !==
          JSON.stringify(
            contactProperties(b[0])
              .filter((p) => p.name === name)
              .map((p) => p.raw)
              .sort(),
          ),
      );
      changed.push({ before: a[0], after: b[0], fields });
    } else if (a.length && b.length)
      ambiguous.push({ label: label(a[0]), before: a.length, after: b.length });
    else {
      removed.push(...a);
      added.push(...b);
    }
  }
  return {
    added,
    removed,
    changed,
    ambiguous,
    unchanged,
    before: before.length,
    after: after.length,
  };
}
