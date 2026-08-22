"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { parseCsv, rowsToContacts, suggestMapping } from "../lib/tabular";
import { KnownVCardVersion, serializeVCards } from "../lib/vcard";
import { guardFile } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";

const sample = "First Name,Last Name,Phone,Email,Organization\nAda,Okafor,+234 801 234 5678,ada@example.test,Northstar Studio\nKojo,Mensah,+233 20 555 0101,kojo@example.test,Northstar Studio";

function download(content: BlobPart, name: string, type: string) {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BulkVCardCreator() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("contacts.csv");
  const [status, setStatus] = useState("Paste or choose a CSV or TSV to begin");
  const [version, setVersion] = useState<KnownVCardVersion>("3.0");
  const parsed = useMemo(() => { if (!text.trim()) return { headers: [], rows: [], warnings: [] as string[] }; const result = parseCsv(text); return { ...result, warnings: result.warnings }; }, [text]);
  const mapped = useMemo(() => rowsToContacts(parsed.rows, suggestMapping(parsed.headers)), [parsed.headers, parsed.rows]);

  function load(value: string, name = "contacts.csv") { setText(value); setFileName(name); setStatus("Table loaded · review the mapping below"); }
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const guard = guardFile(file, [".csv", ".tsv"]);
    if (!guard.ok) { setStatus(guard.message); return; }
    if (guard.warning) setStatus(guard.warning);
    const reader = new FileReader();
    reader.onload = () => load(String(reader.result ?? ""), file.name);
    reader.onerror = () => setStatus("Could not read that file");
    reader.readAsText(file);
  }
  function exportVcf() { if (!mapped.contacts.length) return; download(serializeVCards(mapped.contacts, { version, preserveUnknown: false, includePhotos: false }), `${fileName.replace(/\.(csv|tsv)$/i, "") || "contacts"}.vcf`, "text/vcard;charset=utf-8"); trackEvent("download_clicked", { tool_slug: "bulk-vcard-creator", output_format: "vcf", contact_count_bucket: mapped.contacts.length > 1000 ? "1000-plus" : mapped.contacts.length > 100 ? "101-1000" : "0-100" }); }

  return <div className="creator-card"><div className="creator-toolbar"><span className="file-icon">CSV</span><div><strong>Bulk vCard creator</strong><small aria-live="polite">{status}</small></div><button className="text-button" onClick={() => { load(sample, "sample-contacts.csv"); trackEvent("sample_loaded", { tool_slug: "bulk-vcard-creator", source: "sample" }); }}>Try a sample</button><button className="primary-button compact" onClick={exportVcf} disabled={!mapped.contacts.length}>Download VCF <span>↓</span></button></div>{!text ? <div className="conversion-dropzone"><div className="drop-icon" aria-hidden="true">↥</div><h2>Paste or choose a contact table</h2><p>Use CSV or TSV with a header row. Columns are mapped locally to vCard fields.</p><div className="drop-actions"><button className="primary-button" onClick={() => inputRef.current?.click()}>Choose CSV</button><button className="text-button" onClick={() => setText(sample)}>Paste sample</button></div><input ref={inputRef} type="file" accept=".csv,.tsv,text/csv,text/tab-separated-values" onChange={handleFile} hidden /><small>Nothing is uploaded to create the cards.</small></div> : <><section className="mapping-section"><div className="mapping-heading"><div><p className="eyebrow">BULK PREVIEW</p><h2>{mapped.contacts.length.toLocaleString()} cards will be created.</h2></div><label>Version<select value={version} onChange={(event) => setVersion(event.target.value as KnownVCardVersion)}><option value="2.1">vCard 2.1</option><option value="3.0">vCard 3.0</option><option value="4.0">vCard 4.0</option></select></label></div><p className="mapping-note">Detected columns: {parsed.headers.join(", ") || "none"}. The first phone and email columns become repeatable vCard values when headers contain phone or email.</p></section><section className="preview-section"><div className="preview-table-wrap"><table><thead><tr>{parsed.headers.slice(0, 8).map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{parsed.rows.slice(0, 5).map((row, index) => <tr key={index}>{parsed.headers.slice(0, 8).map((header) => <td key={header}>{row[header] || <span className="empty-cell">—</span>}</td>)}</tr>)}</tbody></table></div><button className="secondary-button" onClick={() => { setText(""); setFileName("contacts.csv"); }}>Start over</button></section>{[...parsed.warnings, ...mapped.warnings].length > 0 && <div className="conversion-warning"><strong>{parsed.warnings.length + mapped.warnings.length} warning{parsed.warnings.length + mapped.warnings.length === 1 ? "" : "s"}</strong>{[...parsed.warnings, ...mapped.warnings].slice(0, 4).map((warning) => <span key={warning}>{warning}</span>)}</div>}</>}</div>;
}
