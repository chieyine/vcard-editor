"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { decodeVCardBytes, parseVCard, Contact, ParseResult } from "../lib/vcard";
import { trackEvent } from "../lib/analytics";

const sample = "BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL:ada@example.test\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nEMAIL:kojo@example.test\nEND:VCARD";

export default function VCardViewer() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to inspect");
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null;
  const filtered = useMemo(() => contacts.filter((contact) => `${contact.formattedName} ${contact.phones.join(" ")} ${contact.emails.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [contacts, query]);

  function openText(text: string, name: string) {
    const parsed = { ...parseVCard(text), encoding: "UTF-8" as const };
    setContacts(parsed.contacts); setResult(parsed); setSelectedId(parsed.contacts[0]?.id ?? null); setFileName(name); setStatus(`${parsed.contacts.length.toLocaleString()} contacts ready · read-only view`);
    trackEvent("parse_succeeded", { tool_slug: "vcf-viewer", contact_count_bucket: parsed.contacts.length > 1000 ? "1000-plus" : parsed.contacts.length > 100 ? "101-1000" : "0-100" });
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const guard = guardFile(file, [".vcf", ".vcard"]); if (!guard.ok) { setStatus(guard.message); return; }
    trackEvent("file_selected", { tool_slug: "vcf-viewer", input_format: "vcf", size_bucket: file.size > 8 * 1024 * 1024 ? "large" : "standard" });
    const reader = new FileReader(); reader.onload = () => { if (reader.result instanceof ArrayBuffer) { const decoded = decodeVCardBytes(reader.result); openText(decoded.text, file.name); } }; reader.onerror = () => setStatus("Could not read that file"); reader.readAsArrayBuffer(file);
  }

  return <div className="viewer-card"><div className="conversion-toolbar"><span className="file-icon">VCF</span><div><strong>{fileName || "VCF Viewer"}</strong><small aria-live="polite">{status}</small></div>{contacts.length > 0 && <a className="secondary-button" href="/tool/vcf-editor">Continue in editor</a>}</div>{!contacts.length ? <div className="conversion-dropzone"><div className="drop-icon" aria-hidden="true">◌</div><h2>Inspect a contact file</h2><p>Read contacts, versions, warnings, and raw fields without changing the source.</p><div className="drop-actions"><label className="primary-button">Choose a VCF file<input aria-label="Choose a VCF file" type="file" accept=".vcf,.vcard,text/vcard" onChange={handleFile} hidden /></label><button className="text-button" onClick={() => { trackEvent("sample_loaded", { tool_slug: "vcf-viewer", source: "sample" }); openText(sample, "sample-contacts.vcf"); }}>Try a sample file</button></div><small>Read locally in your browser · no upload</small></div> : <div className="viewer-body"><aside className="contact-list"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contacts" /></label><div className="list-meta"><span>{filtered.length} shown</span><span>{result?.issues.length ?? 0} warnings</span></div><div className="contacts-scroll">{filtered.map((contact) => <button className={`contact-row ${selected?.id === contact.id ? "active" : ""}`} key={contact.id} onClick={() => setSelectedId(contact.id)}><span className="avatar">{(contact.formattedName || "?").slice(0, 1).toUpperCase()}</span><span><strong>{contact.formattedName || "Unnamed contact"}</strong><small>{contact.emails[0] || contact.phones[0] || "No details"}</small></span></button>)}</div></aside><section className="viewer-detail">{selected ? <><div className="detail-heading"><div><p className="eyebrow">READ-ONLY CONTACT</p><h2>{selected.formattedName || "Unnamed contact"}</h2></div><span className="version-badge">vCard {selected.version}</span></div><div className="form-grid"><label>First name<input value={selected.firstName} readOnly /></label><label>Last name<input value={selected.lastName} readOnly /></label><label className="wide">Phone<input value={selected.phones.join(" · ")} readOnly /></label><label className="wide">Email<input value={selected.emails.join(" · ")} readOnly /></label><label>Organisation<input value={selected.organisation} readOnly /></label><label>Job title<input value={selected.title} readOnly /></label><label className="wide">Note<textarea value={selected.note} readOnly rows={3} /></label></div><details className="raw-details"><summary>Show raw properties</summary><pre>{selected.rawProperties.join("\n")}</pre></details></> : <p>Select a contact.</p>}</section></div>}</div>;
}

