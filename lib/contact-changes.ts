import { contactProperties, type Contact } from "./vcard";

export type ContactChange = {
  name: string;
  field: string;
  before: string;
  after: string;
};
export function contactChanges(before: Contact[], after: Contact[]) {
  const current = new Map(after.map((contact) => [contact.id, contact]));
  const changes: ContactChange[] = [];
  const display = (contact: Contact, field: string) =>
    contactProperties(contact)
      .filter((p) => p.name === field)
      .map((p) =>
        field === "PHOTO"
          ? "Embedded image or photo URL"
          : `${
              Object.keys(p.params).length
                ? `[${Object.entries(p.params)
                    .map(([key, value]) => `${key}=${value.join(",")}`)
                    .join("; ")}] `
                : ""
            }${p.value}`,
      )
      .join(" · ");
  for (const contact of before) {
    const next = current.get(contact.id);
    const name = contact.formattedName || "Unnamed contact";
    if (!next) {
      changes.push({
        name,
        field: "Contact",
        before: "Present",
        after: "Removed",
      });
      continue;
    }
    if (next === contact) continue;
    const a = contactProperties(contact);
    const b = contactProperties(next);
    for (const field of new Set([...a, ...b].map((p) => p.name))) {
      if (
        JSON.stringify(a.filter((p) => p.name === field).map((p) => p.raw)) !==
        JSON.stringify(b.filter((p) => p.name === field).map((p) => p.raw))
      )
        changes.push({
          name,
          field,
          before: display(contact, field),
          after: display(next, field),
        });
    }
  }
  return changes;
}
