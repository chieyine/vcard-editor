"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";
import { Contact, createChangeReport, decodeVCardBytes, KnownVCardVersion, parseVCard, ParseResult, SerializeOptions, serializeVCards } from "../lib/vcard";

const sample = `BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL;TYPE=INTERNET:ada@example.com\nORG:Northstar Studio\nTITLE:Product designer\nCATEGORIES:clients,design\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nTEL;TYPE=WORK:+233 20 555 0101\nEMAIL:kojo@example.com\nNOTE:Call after 10am\nEND:VCARD`;

type WorkerResult = { type: "RESULT"; jobId: string; payload: ParseResult } | { type: "PROGRESS"; jobId: string; percent: number } | { type: "ERROR"; jobId: string; message: string };

function downloadBlob(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AdvancedContactFields({ contact, update }: { contact: Contact; update: (patch: Partial<Contact>) => void }) {
  return <section className="advanced-fields" aria-label="Additional contact fields"><p className="eyebrow">ADDITIONAL FIELDS</p><div className="form-grid"><label>Nickname<input value={contact.nickname ?? ""} onChange={(event) => update({ nickname: event.target.value })} /></label><label>Department<input value={contact.department ?? ""} onChange={(event) => update({ department: event.target.value })} /></label><label>Role<input value={contact.role ?? ""} onChange={(event) => update({ role: event.target.value })} /></label><label>Birthday<input type="date" value={contact.birthday ?? ""} onChange={(event) => update({ birthday: event.target.value })} /></label><label className="wide">Website<input value={contact.url ?? ""} onChange={(event) => update({ url: event.target.value })} placeholder="https://…" /></label><label className="wide">Address<input value={contact.address ?? ""} onChange={(event) => update({ address: event.target.value })} placeholder="Street;City;Region;Postal;Country" /></label></div></section>;
}

function RepeatableFields({ label, values, types, onChange }: { label: "Phone" | "Email"; values: string[]; types: string[]; onChange: (values: string[], types: string[]) => void }) {
  const defaults = label === "Phone" ? "CELL" : "INTERNET";
  const rows = values.length ? values : [""];
  return <fieldset className="repeatable-fields wide"><legend>{label}s</legend>{rows.map((value, index) => <div className="repeatable-row" key={`${label}-${index}`}><label><span>{label} {index + 1}</span><input type={label === "Email" ? "email" : "tel"} value={value} onChange={(event) => { const next = [...rows]; next[index] = event.target.value; onChange(next, types); }} /></label><label><span>Type</span><select value={types[index] || defaults} onChange={(event) => { const next = [...types]; next[index] = event.target.value; onChange(rows, next); }}><option value={defaults}>{defaults}</option><option value="HOME">HOME</option><option value="WORK">WORK</option>{label === "Phone" && <><option value="VOICE">VOICE</option><option value="FAX">FAX</option></>}</select></label><button type="button" className="icon-button" aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} disabled={rows.length === 1 && !value} onClick={() => onChange(rows.filter((_, itemIndex) => itemIndex !== index), types.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}<button type="button" className="text-button" onClick={() => onChange([...rows.filter(Boolean), ""], [...types, defaults])}>+ Add {label.toLowerCase()}</button></fieldset>;
}

function blankContact(index: number): Contact {
  return { id: `new-${Date.now()}-${index}`, version: "3.0", firstName: "", lastName: "", formattedName: "", phones: [], emails: [], organisation: "", title: "", note: "", uid: "", categories: [], photo: "", rawProperties: [], properties: [], issues: [] };
}

export default function VCardEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [past, setPast] = useState<Contact[][]>([]);
  const [future, setFuture] = useState<Contact[][]>([]);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to begin");
  const [statusDetail, setStatusDetail] = useState("");
  const [showWarnings, setShowWarnings] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [rawDraft, setRawDraft] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [exportVersion, setExportVersion] = useState<KnownVCardVersion>("3.0");
  const [preserveUnknown, setPreserveUnknown] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [lineEnding, setLineEnding] = useState<"CRLF" | "LF">("CRLF");
  const [exportScope, setExportScope] = useState<"all" | "selected">("all");
  const [sortKey, setSortKey] = useState<"file" | "name" | "organisation">("file");
  const [scrollTop, setScrollTop] = useState(0);

  const selected = contacts.find((contact) => contact.id === selectedId) ?? null;
  const filtered = useMemo(() => { const matches = contacts.filter((contact) => `${contact.formattedName} ${contact.firstName} ${contact.lastName} ${contact.organisation} ${contact.title} ${contact.uid} ${contact.note} ${contact.emails.join(" ")} ${contact.phones.join(" ")} ${contact.categories.join(" ")}`.toLowerCase().includes(query.toLowerCase())); if (sortKey === "file") return matches; const value = (contact: Contact) => sortKey === "organisation" ? contact.organisation : contact.formattedName || `${contact.firstName} ${contact.lastName}`; return [...matches].sort((left, right) => value(left).localeCompare(value(right), undefined, { sensitivity: "base", numeric: true })); }, [contacts, query, sortKey]);
  const virtualStart = Math.max(0, Math.floor(scrollTop / 62) - 4);
  const virtualEnd = Math.min(filtered.length, virtualStart + 18);
  const visibleContacts = filtered.slice(virtualStart, virtualEnd);
  const issueCount = parseResult?.issues.length ?? 0;
  const hasChanges = past.length > 0;

  function applyParsed(parsed: ParseResult, name: string, source: "worker" | "browser") {
    setContacts(parsed.contacts);
    setPast([]);
    setFuture([]);
    setParseResult(parsed);
    setSelectedId(parsed.contacts[0]?.id ?? null);
    setSelectedIds(new Set());
    setRawDraft(parsed.contacts[0]?.rawProperties.join("\r\n") ?? "");
    setFileName(name);
    setStatus(parsed.contacts.length ? `${parsed.contacts.length.toLocaleString()} contacts ready` : "No contacts found");
    setStatusDetail(`${source === "worker" ? "Worker" : "Browser"} parsed · ${parsed.encoding} · ${parsed.lineEnding}`);
    setShowWarnings(parsed.issues.length > 0);
    setShowRaw(false);
    trackEvent("parse_succeeded", { tool_slug: "vcf-editor", source, contact_count_bucket: parsed.contacts.length > 1000 ? "1000-plus" : parsed.contacts.length > 100 ? "101-1000" : "0-100" });
  }

  function parseWithWorker(buffer: ArrayBuffer, name: string) {
    workerRef.current?.terminate();
    const fallbackBuffer = buffer.slice(0);
    setStatus("Inspecting file…");
    setStatusDetail("Parsing in a private worker");
    trackEvent("parse_started", { tool_slug: "vcf-editor", input_format: "vcf" });
    try {
      const worker = new Worker(new URL("../lib/vcard-worker.ts", import.meta.url), { type: "module" });
      workerRef.current = worker;
      const jobId = `parse-${Date.now()}`;
      const timeout = window.setTimeout(() => { worker.terminate(); workerRef.current = null; const decoded = decodeVCardBytes(fallbackBuffer); applyParsed({ ...parseVCard(decoded.text), encoding: decoded.encoding }, name, "browser"); }, 15000);
      worker.onmessage = (event: MessageEvent<WorkerResult>) => {
        if (event.data.jobId !== jobId) return;
        if (event.data.type === "PROGRESS") { setStatusDetail(`Parsing in a private worker · ${event.data.percent}%`); return; }
        window.clearTimeout(timeout);
        worker.terminate(); workerRef.current = null;
        if (event.data.type === "RESULT") applyParsed(event.data.payload, name, "worker");
        else { const decoded = decodeVCardBytes(fallbackBuffer); applyParsed({ ...parseVCard(decoded.text), encoding: decoded.encoding, warnings: [event.data.message] }, name, "browser"); }
      };
      worker.onerror = () => { window.clearTimeout(timeout); worker.terminate(); workerRef.current = null; const decoded = decodeVCardBytes(fallbackBuffer); applyParsed({ ...parseVCard(decoded.text), encoding: decoded.encoding }, name, "browser"); };
      worker.postMessage({ type: "PARSE", jobId, buffer }, [buffer]);
    } catch {
      const decoded = decodeVCardBytes(fallbackBuffer);
      applyParsed({ ...parseVCard(decoded.text), encoding: decoded.encoding }, name, "browser");
    }
  }

  function cancelParsing() { workerRef.current?.terminate(); workerRef.current = null; setStatus("Parsing cancelled"); setStatusDetail("Your source file was not changed"); }

  function openText(text: string, name: string) {
    applyParsed({ ...parseVCard(text), encoding: "UTF-8" }, name, "browser");
  }

  function readFile(file: File) {
    const guard = guardFile(file, [".vcf", ".vcard"]);
    if (!guard.ok) { setStatus(guard.message); return; }
    trackEvent("file_selected", { tool_slug: "vcf-editor", input_format: "vcf", size_bucket: file.size > 8 * 1024 * 1024 ? "large" : "standard" });
    if (guard.warning) setStatusDetail(guard.warning);
    const reader = new FileReader();
    reader.onload = () => { if (reader.result instanceof ArrayBuffer) parseWithWorker(reader.result, file.name); else setStatus("Could not read that file"); };
    reader.onerror = () => setStatus("Could not read that file");
    reader.readAsArrayBuffer(file);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 1) readFile(files[0]);
    else if (files.length > 1) {
      const invalid = files.map((file) => guardFile(file, [".vcf", ".vcard"])).find((result) => !result.ok);
      if (invalid && !invalid.ok) setStatus(invalid.message);
      else Promise.all(files.map(async (file) => decodeVCardBytes(await file.arrayBuffer()).text)).then((texts) => parseWithWorker(new TextEncoder().encode(texts.join("\r\n")).buffer, `${files.length}-files.vcf`)).catch(() => setStatus("One of those files could not be read"));
    }
    event.target.value = "";
  }

  function commitContacts(next: Contact[], message?: string) {
    setPast((entries) => [...entries.slice(-49), contacts]);
    setContacts(next);
    setFuture([]);
    if (message) setStatus(message);
  }

  function updateSelected(patch: Partial<Contact>) {
    if (!selected) return;
    commitContacts(contacts.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
  }

  function undo() {
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((entries) => [contacts, ...entries]);
    setContacts(previous);
    setPast((entries) => entries.slice(0, -1));
    setStatus("Undid the last change");
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((entries) => [...entries, contacts]);
    setContacts(next);
    setFuture((entries) => entries.slice(1));
    setStatus("Redid the last change");
  }

  function cleanWhitespace() {
    const cleaned = contacts.map((contact) => ({ ...contact, firstName: contact.firstName.trim(), lastName: contact.lastName.trim(), formattedName: contact.formattedName.trim(), organisation: contact.organisation.trim(), title: contact.title.trim(), note: contact.note.trim(), phones: contact.phones.map((value) => value.trim()), emails: contact.emails.map((value) => value.trim()) }));
    commitContacts(cleaned, `Cleaned whitespace in ${cleaned.length.toLocaleString()} contacts`);
  }

  function bulkRemove(field: "photo" | "note" | "address") {
    const affected = contacts.filter((contact) => field === "photo" ? contact.photo : field === "note" ? contact.note : contact.address).length;
    if (!affected) { setStatus(`No ${field} values found`); return; }
    if (!window.confirm(`Remove ${field} values from ${affected} contact${affected === 1 ? "" : "s"}? You can undo this action.`)) return;
    commitContacts(contacts.map((contact) => field === "photo" ? { ...contact, photo: "" } : field === "note" ? { ...contact, note: "" } : { ...contact, address: "" }), `Removed ${field} values from ${affected} contacts`);
  }

  function removeEmpty() {
    const kept = contacts.filter((contact) => contact.formattedName || contact.firstName || contact.lastName || contact.phones.length || contact.emails.length || contact.organisation);
    const removed = contacts.length - kept.length;
    if (!removed) { setStatus("No empty contacts found"); return; }
    commitContacts(kept, `Removed ${removed.toLocaleString()} empty contact${removed === 1 ? "" : "s"}`);
    if (!kept.some((contact) => contact.id === selectedId)) setSelectedId(kept[0]?.id ?? null);
  }

  function selectContact(id: string) {
    setSelectedId(id);
    const next = contacts.find((contact) => contact.id === id);
    setRawDraft(next?.rawProperties.join("\r\n") ?? "");
    setShowRaw(false);
  }

  function toggleSelected(id: string) { setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  function addContact() { const contact = blankContact(contacts.length); commitContacts([...contacts, contact], "Added a blank contact"); setSelectedId(contact.id); setRawDraft(""); }

  function deleteCurrent() { if (!selected || !window.confirm(`Remove ${selected.formattedName || "this contact"}? You can undo this action.`)) return; const next = contacts.filter((contact) => contact.id !== selected.id); commitContacts(next, "Removed one contact"); setSelectedId(next[0]?.id ?? null); setSelectedIds((current) => { const value = new Set(current); value.delete(selected.id); return value; }); }

  function applyRaw() {
    if (!selected) return;
    const parsed = parseVCard(rawDraft);
    if (parsed.contacts.length !== 1) { setStatus("Raw view must contain exactly one vCard"); return; }
    commitContacts(contacts.map((contact) => contact.id === selected.id ? { ...parsed.contacts[0], id: selected.id } : contact), "Applied raw vCard changes");
    setParseResult((current) => current ? { ...current, issues: [...current.issues, ...parsed.issues], warnings: [...current.warnings, ...parsed.warnings] } : current);
    setShowRaw(false);
  }

  function exportOptions(): SerializeOptions { return { version: exportVersion, lineEnding, preserveUnknown, includePhotos }; }

  function download() {
    if (!contacts.length || !parseResult) return;
    const options = exportOptions();
    const exportContacts = exportScope === "selected" ? contacts.filter((contact) => selectedIds.has(contact.id)) : contacts;
    if (!exportContacts.length) { setStatus("Select at least one contact to export"); return; }
    downloadBlob(serializeVCards(exportContacts, options), `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-edited.vcf`, "text/vcard;charset=utf-8");
    trackEvent("download_clicked", { tool_slug: "vcf-editor", output_format: "vcf", contact_count_bucket: contacts.length > 1000 ? "1000-plus" : contacts.length > 100 ? "101-1000" : "0-100" });
    setStatus("Downloaded an updated vCard");
    setStatusDetail(`${exportContacts.length.toLocaleString()} contacts · ${exportVersion} · ${lineEnding}`);
    setShowExport(false);
  }

  function downloadReport() {
    if (!parseResult) return;
    downloadBlob(createChangeReport(parseResult.contacts.length, contacts, parseResult, exportOptions()), `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-change-report.txt`, "text/plain;charset=utf-8");
  }

  function reset() {
    workerRef.current?.terminate(); workerRef.current = null; setContacts([]); setPast([]); setFuture([]); setParseResult(null); setSelectedId(null); setSelectedIds(new Set()); setFileName(""); setStatus("Choose a VCF file to begin"); setStatusDetail(""); setShowWarnings(false); setShowRaw(false); setShowExport(false);
  }

  function loadSample() { trackEvent("sample_loaded", { tool_slug: "vcf-editor", source: "sample" }); openText(sample, "sample-contacts.vcf"); }

  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => () => workerRef.current?.terminate(), []);

  return <div className="editor-card">
    <div className="editor-topbar"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span className="editor-title">Local workspace</span><span className="editor-state" aria-live="polite"><span aria-hidden="true">●</span> {status}{statusDetail && <small>{statusDetail}</small>}</span></div>
    {!contacts.length ? <div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const files = Array.from(event.dataTransfer.files); if (files.length === 1) readFile(files[0]); else if (files.length > 1) Promise.all(files.map(async (file) => decodeVCardBytes(await file.arrayBuffer()).text)).then((texts) => parseWithWorker(new TextEncoder().encode(texts.join("\r\n")).buffer, `${files.length}-files.vcf`)); }}><div className="drop-icon" aria-hidden="true">↥</div><h2>Open contact files</h2><p>Drop one or several <strong>.vcf</strong> or <strong>.vcard</strong> files here, or choose them from your device.</p><div className="drop-actions"><button className="primary-button" onClick={() => inputRef.current?.click()}>Choose VCF files <span>⌘</span></button><button className="text-button" onClick={loadSample}>Try a sample file</button><button className="text-button" onClick={() => applyParsed({ contacts: [blankContact(0)], warnings: [], issues: [], versions: { "3.0": 1 }, lineEnding: "CRLF", encoding: "UTF-8", totalLines: 0 }, "new-contact.vcf", "browser")}>Create blank contact</button></div><input ref={inputRef} aria-label="Choose VCF files" type="file" multiple accept=".vcf,.vcard,text/vcard" onChange={handleFile} hidden /><small>Processed locally in your browser · nothing is uploaded</small>{status.includes("Parsing") || status.includes("Inspecting") ? <button className="text-button" onClick={cancelParsing}>Cancel processing</button> : null}</div> : <>
      <div className="editor-toolbar"><div className="file-summary"><span className="file-icon">VCF</span><span><strong>{fileName}</strong><small>{contacts.length.toLocaleString()} contacts · {Object.entries(parseResult?.versions ?? {}).map(([version, count]) => `${count} v${version}`).join(" · ")}{hasChanges ? " · unsaved changes" : ""}</small></span></div><div className="toolbar-actions"><button className="icon-button" aria-label="Undo" title="Undo" disabled={!past.length} onClick={undo}>↶</button><button className="icon-button" aria-label="Redo" title="Redo" disabled={!future.length} onClick={redo}>↷</button><button className="secondary-button" onClick={reset}>Open another</button><button className="primary-button compact" onClick={() => { trackEvent("export_options_opened", { tool_slug: "vcf-editor" }); setShowExport((value) => !value); }}>Export <span>↓</span></button></div></div>
      {showExport && <div className="export-panel"><div><strong>Export review</strong><small>{issueCount} warning{issueCount === 1 ? "" : "s"} · original source remains unchanged</small></div><label>Contacts<select value={exportScope} onChange={(event) => setExportScope(event.target.value as "all" | "selected")}><option value="all">All {contacts.length} contacts</option><option value="selected">Selected {selectedIds.size} contacts</option></select></label><label>Version<select value={exportVersion} onChange={(event) => setExportVersion(event.target.value as KnownVCardVersion)}><option value="2.1">vCard 2.1</option><option value="3.0">vCard 3.0</option><option value="4.0">vCard 4.0</option></select></label><label>Line endings<select value={lineEnding} onChange={(event) => setLineEnding(event.target.value as "CRLF" | "LF")}><option value="CRLF">CRLF (recommended)</option><option value="LF">LF</option></select></label><label className="check-label"><input type="checkbox" checked={preserveUnknown} onChange={(event) => setPreserveUnknown(event.target.checked)} /> Preserve unknown fields</label><label className="check-label"><input type="checkbox" checked={includePhotos} onChange={(event) => setIncludePhotos(event.target.checked)} /> Include photos</label><div className="export-actions"><button className="text-button" onClick={downloadReport}>Download report</button><button className="primary-button compact" onClick={download}>Download VCF</button></div></div>}
      <div className="bulk-actions"><span>Bulk actions</span><button onClick={addContact}>Add contact</button><button onClick={cleanWhitespace}>Clean whitespace</button><button onClick={removeEmpty}>Remove empty</button><button onClick={() => bulkRemove("photo")}>Remove photos</button><button onClick={() => bulkRemove("note")}>Remove notes</button><span className="bulk-spacer" /><button className={showWarnings ? "active-tool" : ""} onClick={() => setShowWarnings((value) => !value)}>Warnings <b>{issueCount}</b></button></div>
      <div className="editor-body"><aside className="contact-list"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setScrollTop(0); }} placeholder="Search contacts" aria-label="Search names, phones, emails, companies, or notes" /></label><div className="list-controls"><label>Sort<select value={sortKey} onChange={(event) => setSortKey(event.target.value as typeof sortKey)}><option value="file">File order</option><option value="name">Name</option><option value="organisation">Organisation</option></select></label><button className="text-button" onClick={() => setSelectedIds(new Set(filtered.map((contact) => contact.id)))}>Select shown</button><button className="text-button" onClick={() => setSelectedIds(new Set())}>Clear</button></div><div className="list-meta"><span>{filtered.length} shown · {selectedIds.size} selected</span><span>{parseResult?.encoding ?? "UTF-8"}</span></div><div className="contacts-scroll" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}><div style={{ height: virtualStart * 62 }} aria-hidden="true" />
{visibleContacts.map((contact) => <div className={`contact-row ${contact.id === selectedId ? "active" : ""}`} key={contact.id}><input type="checkbox" checked={selectedIds.has(contact.id)} onChange={() => toggleSelected(contact.id)} aria-label={`Select ${contact.formattedName || "unnamed contact"}`} /><button className="contact-open" type="button" onClick={() => selectContact(contact.id)} aria-current={contact.id === selectedId ? "true" : undefined}><span className="avatar" aria-hidden="true">{(contact.formattedName || "?").slice(0, 1).toUpperCase()}</span><span><strong>{contact.formattedName || "Unnamed contact"}</strong><small>{contact.organisation || contact.emails[0] || contact.phones[0] || "No details"}</small></span></button></div>)}
<div style={{ height: Math.max(0, filtered.length - virtualEnd) * 62 }} aria-hidden="true" />{!filtered.length && <p className="empty-list">No matching contacts.</p>}</div></aside><section className="contact-detail">{selected ? <><div className="detail-heading"><div><p className="eyebrow">CONTACT DETAILS</p><h2>{selected.formattedName || "Unnamed contact"}</h2></div><div className="detail-actions"><span className="version-badge">vCard {selected.version}</span><button className="detail-button" onClick={() => { setRawDraft(selected.rawProperties.join("\r\n")); setShowRaw((value) => !value); }}>{showRaw ? "Form view" : "Raw view"}</button></div></div>{showWarnings && <div className="warning-panel" role="status"><strong>{issueCount ? `${issueCount} issue${issueCount === 1 ? "" : "s"} found` : "No issues found"}</strong>{parseResult?.issues.slice(0, 5).map((issue, index) => <p key={`${issue.code}-${index}`}><span>{issue.severity === "error" ? "!" : "•"}</span>{issue.message}</p>)}{issueCount > 5 && <small>Showing the first 5 issues. The change report includes all warnings.</small>}</div>}{showRaw ? <div className="raw-panel"><label htmlFor="raw-vcard">Raw vCard for {selected.formattedName || "this contact"}</label><textarea id="raw-vcard" value={rawDraft} onChange={(event) => setRawDraft(event.target.value)} rows={14} spellCheck={false} /><div><button className="secondary-button" onClick={() => setShowRaw(false)}>Cancel</button><button className="primary-button compact" onClick={applyRaw}>Apply raw changes</button></div></div> : <div className="form-grid"><label>First name<input value={selected.firstName} onChange={(event) => updateSelected({ firstName: event.target.value, formattedName: [event.target.value, selected.lastName].filter(Boolean).join(" ") })} /></label><label>Last name<input value={selected.lastName} onChange={(event) => updateSelected({ lastName: event.target.value, formattedName: [selected.firstName, event.target.value].filter(Boolean).join(" ") })} /></label><label className="wide">Formatted name<input value={selected.formattedName} onChange={(event) => updateSelected({ formattedName: event.target.value })} /></label><RepeatableFields label="Phone" values={selected.phones} types={selected.phoneTypes ?? []} onChange={(phones, phoneTypes) => updateSelected({ phones, phoneTypes })} /><RepeatableFields label="Email" values={selected.emails} types={selected.emailTypes ?? []} onChange={(emails, emailTypes) => updateSelected({ emails, emailTypes })} /><label>Organisation<input value={selected.organisation} onChange={(event) => updateSelected({ organisation: event.target.value })} /></label><label>Job title<input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} /></label><label className="wide">Categories<input value={selected.categories.join(", ")} onChange={(event) => updateSelected({ categories: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></label><label className="wide">Note<textarea value={selected.note} onChange={(event) => updateSelected({ note: event.target.value })} rows={3} /></label></div>}<AdvancedContactFields contact={selected} update={updateSelected} /><div className="detail-footer"><span><span className="saved-dot" aria-hidden="true" /> {hasChanges ? "Unsaved changes stay in this browser" : "Changes stay in this browser"}</span><button className="danger-button" onClick={deleteCurrent}>Remove contact</button></div></> : <div className="empty-detail">Select a contact to edit it.</div>}</section></div>
    </>}
  </div>;
}
