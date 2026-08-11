"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { contactsToSqlite, sqliteToContacts } from "../lib/sqlite";
import { decodeVCardBytes, parseVCard, serializeVCards, type Contact } from "../lib/vcard";

function download(content: BlobPart, name: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }

export default function SqliteWorkspace({ direction }: { direction: "to-sqlite" | "from-sqlite" }) {
  const inputRef = useRef<HTMLInputElement>(null); const [contacts, setContacts] = useState<Contact[]>([]); const [fileName, setFileName] = useState(""); const [status, setStatus] = useState(direction === "to-sqlite" ? "Choose a VCF file" : "Choose a SQLite database"); const [busy, setBusy] = useState(false);
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const extensions = direction === "to-sqlite" ? [".vcf", ".vcard"] : [".sqlite", ".sqlite3", ".db"];
    const guard = guardFile(file, extensions); if (!guard.ok) { setStatus(guard.message); return; }
    setBusy(true); setStatus("Reading locally…");
    try { const buffer = await file.arrayBuffer(); if (direction === "to-sqlite") { const parsed = parseVCard(decodeVCardBytes(buffer).text); setContacts(parsed.contacts); setStatus(`${parsed.contacts.length.toLocaleString()} contacts ready`); } else { const parsed = await sqliteToContacts(buffer); setContacts(parsed.contacts); setStatus(`${parsed.contacts.length.toLocaleString()} contacts mapped from ${parsed.tableName || "the database"}${parsed.warnings.length ? ` · ${parsed.warnings[0]}` : ""}`); } setFileName(file.name); }
    catch { setContacts([]); setStatus("That file is not a readable supported database. Your source is unchanged."); }
    finally { setBusy(false); }
  }
  async function exportResult() {
    if (!contacts.length || busy) return; setBusy(true);
    try { if (direction === "to-sqlite") { setStatus("Building SQLite database locally…"); const bytes = await contactsToSqlite(contacts); const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; download(buffer, `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.sqlite`, "application/vnd.sqlite3"); setStatus("SQLite database downloaded"); } else { download(serializeVCards(contacts, { version: "3.0", preserveUnknown: false }), `${fileName.replace(/\.(sqlite3?|db)$/i, "") || "contacts"}.vcf`, "text/vcard;charset=utf-8"); setStatus("VCF downloaded"); } }
    catch { setStatus("The output could not be created. Your source file is unchanged."); }
    finally { setBusy(false); }
  }
  const inputLabel = direction === "to-sqlite" ? "VCF file" : "SQLite database";
  return <div className="conversion-card"><div className="conversion-toolbar"><span className="file-icon" aria-hidden="true">SQL</span><div><strong>{fileName || (direction === "to-sqlite" ? "VCF to SQLite" : "SQLite to VCF")}</strong><small aria-live="polite">{status}</small></div>{contacts.length > 0 && <button className="primary-button compact" onClick={exportResult} disabled={busy}>{busy ? "Working…" : `Download ${direction === "to-sqlite" ? "SQLite" : "VCF"}`} <span>↓</span></button>}</div>{!contacts.length ? <div className="conversion-dropzone"><div className="drop-icon" aria-hidden="true">↥</div><h2>Choose a {inputLabel}</h2><p>SQL parsing and generation run locally. Database rows and contact values do not leave this browser.</p><button className="primary-button" onClick={() => inputRef.current?.click()} disabled={busy}>Choose {inputLabel} <span>⌘</span></button><input ref={inputRef} type="file" accept={direction === "to-sqlite" ? ".vcf,.vcard,text/vcard" : ".sqlite,.sqlite3,.db,application/vnd.sqlite3"} onChange={handleFile} hidden aria-label={`Choose a ${inputLabel}`} /></div> : <section className="preview-section"><div className="preview-heading"><div><p className="eyebrow">MAPPED PREVIEW</p><h2>{contacts.length.toLocaleString()} contacts</h2></div><button className="secondary-button" onClick={() => { setContacts([]); setFileName(""); }}>Open another</button></div><div className="preview-table-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Organisation</th></tr></thead><tbody>{contacts.slice(0, 8).map((contact) => <tr key={contact.id}><td>{contact.formattedName || "—"}</td><td>{contact.phones[0] || "—"}</td><td>{contact.emails[0] || "—"}</td><td>{contact.organisation || "—"}</td></tr>)}</tbody></table></div></section>}</div>;
}
