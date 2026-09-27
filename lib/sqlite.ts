import type { Contact } from "./vcard";
import { rowsToContacts, suggestMapping, type TabularRow } from "./tabular";

type SqlValue = number | string | Uint8Array | null;

async function loadSqlite() {
  const module = await import("sql.js/dist/sql-asm-memory-growth.js");
  return module.default();
}

function emptyContact(index: number): Contact {
  return {
    id: `sqlite-${index + 1}`,
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

export async function contactsToSqlite(contacts: Contact[]) {
  if (contacts.length > 10000)
    throw new Error("Export at most 10,000 contacts per database.");
  const SQL = await loadSqlite();
  const database = new SQL.Database();
  try {
    database.run("PRAGMA foreign_keys = ON");
    database.run(
      "CREATE TABLE contacts (id INTEGER PRIMARY KEY, uid TEXT, full_name TEXT NOT NULL, first_name TEXT, last_name TEXT, nickname TEXT, organisation TEXT, department TEXT, title TEXT, role TEXT, website TEXT, birthday TEXT, address TEXT, note TEXT, vcard_version TEXT)",
    );
    database.run(
      "CREATE TABLE phones (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)",
    );
    database.run(
      "CREATE TABLE emails (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, type TEXT, position INTEGER NOT NULL)",
    );
    database.run(
      "CREATE TABLE categories (contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, value TEXT NOT NULL, position INTEGER NOT NULL)",
    );
    const contactStatement = database.prepare(
      "INSERT INTO contacts (id, uid, full_name, first_name, last_name, nickname, organisation, department, title, role, website, birthday, address, note, vcard_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const phoneStatement = database.prepare(
      "INSERT INTO phones (contact_id, value, type, position) VALUES (?, ?, ?, ?)",
    );
    const emailStatement = database.prepare(
      "INSERT INTO emails (contact_id, value, type, position) VALUES (?, ?, ?, ?)",
    );
    const categoryStatement = database.prepare(
      "INSERT INTO categories (contact_id, value, position) VALUES (?, ?, ?)",
    );
    database.run("BEGIN TRANSACTION");
    contacts.forEach((contact, index) => {
      const id = index + 1;
      contactStatement.run([
        id,
        contact.uid,
        contact.formattedName,
        contact.firstName,
        contact.lastName,
        contact.nickname ?? "",
        contact.organisation,
        contact.department ?? "",
        contact.title,
        contact.role ?? "",
        contact.url ?? "",
        contact.birthday ?? "",
        contact.address ?? "",
        contact.note,
        contact.version,
      ]);
      contact.phones.forEach((value, position) =>
        phoneStatement.run([
          id,
          value,
          contact.phoneTypes?.[position] ?? "",
          position,
        ]),
      );
      contact.emails.forEach((value, position) =>
        emailStatement.run([
          id,
          value,
          contact.emailTypes?.[position] ?? "",
          position,
        ]),
      );
      contact.categories.forEach((value, position) =>
        categoryStatement.run([id, value, position]),
      );
    });
    database.run("COMMIT");
    contactStatement.free();
    phoneStatement.free();
    emailStatement.free();
    categoryStatement.free();
    return database.export();
  } finally {
    database.close();
  }
}

function resultRows(
  result: { columns: string[]; values: SqlValue[][] } | undefined,
) {
  if (!result) return [] as TabularRow[];
  return result.values.map((values) =>
    result.columns.reduce<TabularRow>((row, column, index) => {
      const value = values[index];
      row[column] =
        value instanceof Uint8Array ? "" : value == null ? "" : String(value);
      return row;
    }, {}),
  );
}

function directSchemaContacts(
  database: InstanceType<Awaited<ReturnType<typeof loadSqlite>>["Database"]>,
) {
  const byId = new Map<string, Contact>();
  const contacts = resultRows(
    database.exec("SELECT * FROM contacts ORDER BY id")[0],
  ).map((row, index) => {
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
      version:
        row.vcard_version === "2.1" || row.vcard_version === "4.0"
          ? row.vcard_version
          : "3.0",
    } satisfies Contact;
    byId.set(row.id || String(index + 1), contact);
    return contact;
  });
  resultRows(
    database.exec(
      "SELECT contact_id, value, type FROM phones ORDER BY contact_id, position",
    )[0],
  ).forEach((row) => {
    const contact = byId.get(row.contact_id);
    if (contact) {
      contact.phones.push(row.value);
      (contact.phoneTypes ??= []).push(row.type);
    }
  });
  resultRows(
    database.exec(
      "SELECT contact_id, value, type FROM emails ORDER BY contact_id, position",
    )[0],
  ).forEach((row) => {
    const contact = byId.get(row.contact_id);
    if (contact) {
      contact.emails.push(row.value);
      (contact.emailTypes ??= []).push(row.type);
    }
  });
  resultRows(
    database.exec(
      "SELECT contact_id, value FROM categories ORDER BY contact_id, position",
    )[0],
  ).forEach((row) => {
    const contact = byId.get(row.contact_id);
    if (contact) contact.categories.push(row.value);
  });
  return contacts;
}

export async function sqliteToContacts(
  buffer: ArrayBuffer,
  selectedTable?: string,
) {
  if (buffer.byteLength > 5 * 1024 * 1024)
    throw new Error("SQLite imports are limited to 5 MB.");
  const SQL = await loadSqlite();
  const database = new SQL.Database(new Uint8Array(buffer));
  try {
    const tables = resultRows(
      database.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )[0],
    ).map((row) => row.name);
    if (!tables.length)
      return {
        contacts: [] as Contact[],
        tableName: "",
        tables,
        warnings: ["The database contains no readable user tables."],
      };
    const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;
    const required: Record<string, string[]> = {
      contacts: [
        "id",
        "uid",
        "full_name",
        "first_name",
        "last_name",
        "vcard_version",
      ],
      phones: ["contact_id", "value", "type", "position"],
      emails: ["contact_id", "value", "type", "position"],
      categories: ["contact_id", "value", "position"],
    };
    const direct = Object.entries(required).every(
      ([table, columns]) =>
        tables.includes(table) &&
        columns.every((column) =>
          resultRows(
            database.exec(`PRAGMA table_info(${quote(table)})`)[0],
          ).some((row) => row.name === column),
        ),
    );
    const tableName = selectedTable ?? (direct ? "contacts" : tables[0]);
    if (!tables.includes(tableName))
      throw new Error("Choose an existing table.");
    const count = (table: string) =>
      Number(
        resultRows(
          database.exec(`SELECT COUNT(*) AS count FROM ${quote(table)}`)[0],
        )[0]?.count ?? 0,
      );
    if (count(tableName) > 10000)
      throw new Error(
        "The selected table exceeds 10,000 rows. Export a smaller database first; no rows were silently truncated.",
      );
    if (direct && tableName === "contacts") {
      if (
        ["phones", "emails", "categories"].some(
          (table) => count(table) > 100000,
        )
      )
        throw new Error("A related table exceeds 100,000 values.");
      return {
        contacts: directSchemaContacts(database),
        tableName,
        tables,
        warnings: [
          "Imported the contact schema. Photos, vendor properties and repeated address/organization fields are not represented in this database format.",
        ],
      };
    }
    const result = database.exec(
      `SELECT * FROM ${quote(tableName)} LIMIT 10000`,
    )[0];
    if ((result?.columns.length ?? 0) > 256)
      throw new Error("The selected table has more than 256 columns.");
    const rows = resultRows(result);
    const mapping = suggestMapping(result?.columns ?? []);
    const mapped = rowsToContacts(rows, mapping);
    const ignored = Object.entries(mapping)
      .filter(([, field]) => field === "ignore")
      .map(([name]) => name);
    const warnings = [
      `Imported “${tableName}” with automatic column mapping. Review the preview. Binary values are not imported.`,
      ...(ignored.length ? [`Unmapped columns: ${ignored.join(", ")}`] : []),
      ...mapped.warnings,
    ];
    return { contacts: mapped.contacts, tableName, tables, warnings };
  } finally {
    database.close();
  }
}
