import type { Contact } from "./vcard";
import { suggestMapping, type TabularRow } from "./tabular";

type SqlValue = number | string | Uint8Array | null;

async function loadSqlite() {
  const module = await import("sql.js/dist/sql-asm-memory-growth.js");
  return module.default();
}

function emptyContact(index: number): Contact {
  return { id: `sqlite-${index + 1}`, version: "3.0", firstName: "", lastName: "", formattedName: "", phones: [], emails: [], organisation: "", title: "", note: "", uid: "", categories: [], photo: "", rawProperties: [], properties: [], issues: [] };
}

export async function contactsToSqlite(contacts: Contact[]) {
  const SQL = await loadSqlite();
  const database = new SQL.Database();
  try {
    database.run("PRAGMA foreign_keys = ON");
    database.run("CREATE TABLE contacts (id INTEGER PRIMARY KEY, uid TEXT, full_name TEXT NOT NULL, first_name TEXT, last_name TEXT, nickname TEXT, organisation TEXT, department TEXT, title TEXT, role TEXT, website TEXT, birthday TEXT, address TEXT, note TEXT, vcard_version TEXT)");
    database.run("CREATE TABLE phones (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)");
    database.run("CREATE TABLE emails (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)");
    database.run("CREATE TABLE categories (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, position INTEGER NOT NULL)");
    const contactStatement = database.prepare("INSERT INTO contacts (id, uid, full_name, first_name, last_name, nickname, organisation, department, title, role, website, birthday, address, note, vcard_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const phoneStatement = database.prepare("INSERT INTO phones (contact_id, value, type, position) VALUES (?, ?, ?, ?)");
    const emailStatement = database.prepare("INSERT INTO emails (contact_id, value, type, position) VALUES (?, ?, ?, ?)");
    const categoryStatement = database.prepare("INSERT INTO categories (contact_id, value, position) VALUES (?, ?, ?)");
    database.run("BEGIN TRANSACTION");
    contacts.forEach((contact, index) => {
      const id = index + 1;
      contactStatement.run([id, contact.uid, contact.formattedName, contact.firstName, contact.lastName, contact.nickname ?? "", contact.organisation, contact.department ?? "", contact.title, contact.role ?? "", contact.url ?? "", contact.birthday ?? "", contact.address ?? "", contact.note, contact.version]);
      contact.phones.forEach((value, position) => phoneStatement.run([id, value, contact.phoneTypes?.[position] ?? "", position]));
      contact.emails.forEach((value, position) => emailStatement.run([id, value, contact.emailTypes?.[position] ?? "", position]));
      contact.categories.forEach((value, position) => categoryStatement.run([id, value, position]));
    });
    database.run("COMMIT");
    contactStatement.free(); phoneStatement.free(); emailStatement.free(); categoryStatement.free();
    return database.export();
  } finally {
    database.close();
  }
}

function resultRows(result: { columns: string[]; values: SqlValue[][] } | undefined) {
  if (!result) return [] as TabularRow[];
  return result.values.map((values) => result.columns.reduce<TabularRow>((row, column, index) => {
    const value = values[index];
    row[column] = value instanceof Uint8Array ? "" : value == null ? "" : String(value);
    return row;
  }, {}));
}

function directSchemaContacts(database: InstanceType<Awaited<ReturnType<typeof loadSqlite>>["Database"]>) {
  const byId = new Map<string, Contact>();
  const contacts = resultRows(database.exec("SELECT * FROM contacts ORDER BY id")[0]).map((row, index) => {
    const contact = {
      ...emptyContact(index),
      id: `sqlite-${row.id || index + 1}`,
      uid: row.uid ?? "",
      formattedName: row.full_name ?? "",
      firstName: row.first_name ?? "",
      lastName: row.last_name ?? "",
      nickname: row.nickname ?? "",
      organisation: row.organisation ?? "",
      department: row.department ?? "",
      title: row.title ?? "",
      role: row.role ?? "",
      url: row.website ?? "",
      birthday: row.birthday ?? "",
      address: row.address ?? "",
      note: row.note ?? "",
      version: row.vcard_version === "2.1" || row.vcard_version === "4.0" ? row.vcard_version : "3.0",
    } satisfies Contact;
    byId.set(row.id || String(index + 1), contact);
    return contact;
  });
  resultRows(database.exec("SELECT contact_id, value, type FROM phones ORDER BY contact_id, position")[0]).forEach((row) => { const contact = byId.get(row.contact_id); if (contact) { contact.phones.push(row.value); (contact.phoneTypes ??= []).push(row.type); } });
  resultRows(database.exec("SELECT contact_id, value, type FROM emails ORDER BY contact_id, position")[0]).forEach((row) => { const contact = byId.get(row.contact_id); if (contact) { contact.emails.push(row.value); (contact.emailTypes ??= []).push(row.type); } });
  resultRows(database.exec("SELECT contact_id, value FROM categories ORDER BY contact_id, position")[0]).forEach((row) => { const contact = byId.get(row.contact_id); if (contact) contact.categories.push(row.value); });
  return contacts;
}

export async function sqliteToContacts(buffer: ArrayBuffer) {
  const SQL = await loadSqlite();
  const database = new SQL.Database(new Uint8Array(buffer));
  try {
    const tables = resultRows(database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]).map((row) => row.name);
    if (!tables.length) return { contacts: [] as Contact[], tableName: "", warnings: ["The database contains no readable user tables."] };
    if (tables.includes("contacts") && tables.includes("phones") && tables.includes("emails")) return { contacts: directSchemaContacts(database), tableName: "contacts", warnings: [] as string[] };
    const tableName = tables[0];
    const safeTableName = `"${tableName.replace(/"/g, '""')}"`;
    const result = database.exec(`SELECT * FROM ${safeTableName} LIMIT 100000`)[0];
    const rows = resultRows(result);
    const headers = result?.columns ?? [];
    const mapping = suggestMapping(headers);
    const contacts = rows.map((row, index) => {
      const contact = emptyContact(index);
      Object.entries(mapping).forEach(([header, field]) => {
        const value = row[header]?.trim();
        if (!value || field === "ignore") return;
        if (field === "phone") contact.phones.push(value);
        else if (field === "email") contact.emails.push(value);
        else if (field === "categories") contact.categories.push(...value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean));
        else contact[field] = value;
      });
      if (!contact.formattedName) contact.formattedName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
      return contact;
    });
    const warnings = Object.values(mapping).every((value) => value === "ignore") ? ["No contact-like columns were recognized in the first table."] : [`Imported the first user table, “${tableName}”. Review the mapped contact preview before export.`];
    return { contacts, tableName, warnings };
  } finally {
    database.close();
  }
}
