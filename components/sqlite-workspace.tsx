"use client";

import { downloadFile as download } from "../lib/download";

import { ChangeEvent, useRef, useState } from "react";
import { useLocalOperation } from "../lib/use-local-operation";
import { guardFile } from "../lib/file-guard";
import { contactsToSqlite, sqliteToContacts } from "../lib/sqlite";
import {
  decodeVCardBytes,
  parseVCard,
  serializeVCards,
  type Contact,
} from "../lib/vcard";

export default function SqliteWorkspace({
  direction,
}: {
  direction: "to-sqlite" | "from-sqlite";
}) {
  const operation = useLocalOperation();
  const databaseRef = useRef<ArrayBuffer | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [tableName, setTableName] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState(
    direction === "to-sqlite"
      ? "Choose a VCF file"
      : "Choose a SQLite database",
  );
  const [busy, setBusy] = useState(false);
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setContacts([]);
    setWarnings([]);
    setTables([]);
    setBusy(true);
    setStatus("Reading locally…");
    try {
      const guard = guardFile(
        file,
        direction === "to-sqlite"
          ? [".vcf", ".vcard"]
          : [".sqlite", ".sqlite3", ".db"],
      );
      if (!guard.ok) throw new Error(guard.message);
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      if (direction === "to-sqlite") {
        const parsed = parseVCard(decodeVCardBytes(buffer).text);
        setContacts(parsed.contacts);
        setWarnings([
          "This table export omits photos, vendor properties, extra name components and repeated address/organization fields. Keep the original VCF.",
        ]);
      } else {
        const parsed = await sqliteToContacts(buffer);
        if (!job.current()) return;
        databaseRef.current = buffer;
        setContacts(parsed.contacts);
        setTables(parsed.tables);
        setTableName(parsed.tableName);
        setWarnings(parsed.warnings);
      }
      setFileName(file.name);
      setStatus("Review the mapped output before downloading");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read the file.",
        );
        job.fail();
      }
    } finally {
      if (job.current()) setBusy(false);
    }
  }
  async function chooseTable(name: string) {
    if (!databaseRef.current) return;
    const job = operation.begin();
    setTableName(name);
    setContacts([]);
    setBusy(true);
    try {
      const parsed = await sqliteToContacts(databaseRef.current, name);
      if (!job.current()) return;
      setContacts(parsed.contacts);
      setWarnings(parsed.warnings);
      setStatus("Table mapped. Review the output.");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read the table.",
        );
        job.fail();
      }
    } finally {
      if (job.current()) setBusy(false);
    }
  }

  async function exportResult() {
    if (!contacts.length || busy) return;
    const job = operation.begin();
    setBusy(true);
    try {
      if (direction === "to-sqlite") {
        setStatus("Building SQLite database locally…");
        const bytes = await contactsToSqlite(contacts);
        if (!job.current()) return;
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        download(
          buffer,
          `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.sqlite`,
          "application/vnd.sqlite3",
        );
        setStatus("SQLite database downloaded");
      } else {
        download(
          serializeVCards(contacts, { version: "3.0", preserveUnknown: false }),
          `${fileName.replace(/\.(sqlite3?|db)$/i, "") || "contacts"}.vcf`,
          "text/vcard;charset=utf-8",
        );
        setStatus("VCF downloaded");
      }
    } catch (error) {
      if (job.current())
        setStatus(
          error instanceof Error
            ? error.message
            : "Could not create the output.",
        );
    } finally {
      if (job.current()) {
        setBusy(false);
        job.finish();
      }
    }
  }
  const inputLabel = direction === "to-sqlite" ? "VCF file" : "SQLite database";
  return (
    <div className="conversion-card">
      <div className="conversion-toolbar">
        <span className="file-icon" aria-hidden="true">
          SQL
        </span>
        <div>
          <strong>
            {fileName ||
              (direction === "to-sqlite" ? "VCF to SQLite" : "SQLite to VCF")}
          </strong>
          <small aria-live="polite">{status}</small>
        </div>
        {contacts.length > 0 && (
          <button
            className="primary-button compact"
            onClick={exportResult}
            disabled={busy}
          >
            {busy
              ? "Working…"
              : `Download ${direction === "to-sqlite" ? "SQLite" : "VCF"}`}{" "}
            <span>↓</span>
          </button>
        )}
      </div>
      {tables.length > 0 && (
        <label className="mapping-tools">
          Source table
          <select
            value={tableName}
            onChange={(event) => {
              void chooseTable(event.target.value);
            }}
          >
            {tables.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      )}
      {warnings.length > 0 && (
        <div className="conversion-warning">
          {warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      )}
      {!contacts.length ? (
        <div className="conversion-dropzone">
          <div className="drop-icon" aria-hidden="true">
            ↥
          </div>
          <h2>Choose a {inputLabel}</h2>
          <p>
            SQL parsing and generation run locally. Database rows and contact
            values do not leave this browser.
          </p>
          <button
            className="primary-button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            Choose {inputLabel}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={
              direction === "to-sqlite"
                ? ".vcf,.vcard,text/vcard"
                : ".sqlite,.sqlite3,.db,application/vnd.sqlite3"
            }
            onChange={handleFile}
            hidden
            aria-label={`Choose a ${inputLabel}`}
          />
        </div>
      ) : (
        <section className="preview-section">
          <div className="preview-heading">
            <div>
              <p className="eyebrow">MAPPED PREVIEW</p>
              <h2>{contacts.length.toLocaleString()} contacts</h2>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                operation.cancel();
                setBusy(false);
                setContacts([]);
                setFileName("");
                setTables([]);
                setWarnings([]);
                databaseRef.current = null;
              }}
            >
              Open another
            </button>
          </div>
          <div className="preview-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Organization</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 8).map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.formattedName || "—"}</td>
                    <td>{contact.phones[0] || "—"}</td>
                    <td>{contact.emails[0] || "—"}</td>
                    <td>{contact.organisation || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
