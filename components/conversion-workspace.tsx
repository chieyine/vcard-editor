"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { zipSync } from "fflate";
import { decodeVCardBytes, parseVCard, serializeVCards } from "../lib/vcard";
import { CONTACT_COLUMNS, ContactColumn, contactsToRows, parseCsv, parseSpreadsheet, rowsToContacts, rowsToCsv, rowsToXlsx, suggestMapping, TabularRow } from "../lib/tabular";
import { guardFile } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";
import type { KnownVCardVersion } from "../lib/vcard";

export type ConversionMode = "vcf-to-csv" | "csv-to-vcf" | "tsv-to-vcf" | "vcf-to-xlsx" | "xlsx-to-vcf";

const configs: Record<ConversionMode, { title: string; input: string; output: string; accept: string; inputKind: "vcf" | "csv" | "xlsx" }> = {
  "vcf-to-csv": { title: "VCF to CSV", input: "VCF or vCard", output: "CSV spreadsheet", accept: ".vcf,.vcard,text/vcard", inputKind: "vcf" },
  "csv-to-vcf": { title: "CSV to VCF", input: "CSV spreadsheet", output: "vCard contact file", accept: ".csv,text/csv", inputKind: "csv" },
  "tsv-to-vcf": { title: "TSV to VCF", input: "TSV spreadsheet", output: "vCard contact file", accept: ".tsv,.csv,text/tab-separated-values,text/csv", inputKind: "csv" },
  "vcf-to-xlsx": { title: "VCF to Excel", input: "VCF or vCard", output: "Excel workbook", accept: ".vcf,.vcard,text/vcard", inputKind: "vcf" },
  "xlsx-to-vcf": { title: "Excel to VCF", input: "Excel workbook", output: "vCard contact file", accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", inputKind: "xlsx" },
};

const sampleVcf = "BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL:ada@example.test\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nEMAIL:kojo@example.test\nEND:VCARD";
const sampleCsv = "First Name,Last Name,Phone,Email\nAda,Okafor,+234 801 234 5678,ada@example.test\nKojo,Mensah,+233 20 555 0101,kojo@example.test";

function downloadBlob(content: BlobPart, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConversionWorkspace({ mode }: { mode: ConversionMode }) {
  const config = configs[mode];
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [contacts, setContacts] = useState<ReturnType<typeof parseVCard>["contacts"]>([]);
  const [rows, setRows] = useState<TabularRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, ContactColumn | "ignore">>({});
  const [preset, setPreset] = useState<"generic" | "google" | "outlook">("generic");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState("Choose a file to begin");
  const [sheetName, setSheetName] = useState("");
  const [outputVersion, setOutputVersion] = useState<KnownVCardVersion>("3.0");
  const [outputMode, setOutputMode] = useState<"combined" | "individual">("combined");
  const [excludedColumns, setExcludedColumns] = useState<Set<string>>(new Set());

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);
  const mappedContacts = useMemo(() => rowsToContacts(rows, mapping), [rows, mapping]);
  const isTabularInput = config.inputKind !== "vcf";
  const outputName = fileName.replace(/\.(vcf|vcard|csv|xlsx|xls)$/i, "") || "contacts";
  const columnBase = (header: string) => {
    const match = header.match(/^(Phone|Email) \d+$/);
    return match ? match[1] : header;
  };
  const isColumnExcluded = (header: string) => excludedColumns.has(columnBase(header));
  const activeColumnCount = headers.filter((header) => !isColumnExcluded(header)).length;

  function applyTabular(headersToUse: string[], rowsToUse: TabularRow[], nextWarnings: string[], sourceName: string, nextSheetName = "") {
    setHeaders(headersToUse); setRows(rowsToUse); setMapping(suggestMapping(headersToUse)); setPreset("generic"); setWarnings(nextWarnings); setFileName(sourceName); setSheetName(nextSheetName); setContacts([]); setExcludedColumns(new Set()); setStatus(`${rowsToUse.length.toLocaleString()} rows ready`);
  }

  function processFile(file: File) {
    const allowedExtensions = config.inputKind === "vcf" ? [".vcf", ".vcard"] : config.inputKind === "csv" ? [".csv"] : [".xlsx", ".xls"];
    const guard = guardFile(file, allowedExtensions);
    if (!guard.ok) { setStatus(guard.message); return; }
    trackEvent("file_selected", { tool_slug: mode, input_format: config.inputKind, size_bucket: file.size > 8 * 1024 * 1024 ? "large" : "standard" });
    trackEvent("tool_run_started", { tool_slug: mode, input_format: config.inputKind });
    if (guard.warning) setStatus(guard.warning);
    const reader = new FileReader();
    reader.onload = async () => {
      if (!(reader.result instanceof ArrayBuffer)) { setStatus("Could not read that file"); return; }
      try {
        if (config.inputKind === "vcf") {
          const decoded = decodeVCardBytes(reader.result);
          const parsed = parseVCard(decoded.text);
          const nextRows = contactsToRows(parsed.contacts);
          const nextHeaders = Array.from(new Set(nextRows.flatMap((row) => Object.keys(row))));
          setContacts(parsed.contacts); setRows(nextRows); setHeaders(nextHeaders); setWarnings(parsed.warnings); setMapping({}); setPreset("generic"); setFileName(file.name); setStatus(`${parsed.contacts.length.toLocaleString()} contacts ready`); setSheetName(""); setExcludedColumns(new Set());
        } else if (config.inputKind === "csv") {
          const parsed = parseCsv(new TextDecoder("utf-8", { fatal: false }).decode(reader.result));
          applyTabular(parsed.headers, parsed.rows, parsed.warnings, file.name);
        } else {
          const parsed = await parseSpreadsheet(reader.result);
          applyTabular(parsed.headers, parsed.rows, parsed.warnings, file.name, parsed.sheetName);
        }
      } catch (error) { setStatus(error instanceof Error ? error.message : "That file could not be processed"); }
    };
    reader.onerror = () => setStatus("Could not read that file");
    reader.readAsArrayBuffer(file);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (file) processFile(file); event.target.value = ""; }

  function loadSample() {
    if (config.inputKind === "xlsx") { setStatus("Choose an Excel workbook to preview its sheet and mapping."); return; }
    processFile(new File([config.inputKind === "vcf" ? sampleVcf : sampleCsv], config.inputKind === "vcf" ? "sample-contacts.vcf" : "sample-contacts.csv", { type: config.inputKind === "vcf" ? "text/vcard" : "text/csv" }));
    trackEvent("sample_loaded", { tool_slug: mode, source: "sample" });
  }

  function download() {
    if (!rows.length && !contacts.length) return;
      if (mode === "csv-to-vcf" || mode === "tsv-to-vcf" || mode === "xlsx-to-vcf") {
      if (!Object.values(mapping).some((value) => value !== "ignore")) { setStatus("Map at least one source column before exporting"); return; }
      const converted = mappedContacts;
      if (outputMode === "individual") {
        const files = Object.fromEntries(converted.contacts.map((contact, index) => [`${String(index + 1).padStart(4, "0")}-${(contact.formattedName || `contact-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `contact-${index + 1}`}.vcf`, new TextEncoder().encode(serializeVCards([contact], { version: outputVersion, preserveUnknown: false }))]));
        const archive = zipSync(files);
        // fflate returns a Uint8Array whose generic buffer type can include
        // SharedArrayBuffer in newer TypeScript libs; Blob accepts the
        // concrete browser ArrayBuffer produced here.
        downloadBlob(archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer, `${outputName}-contacts.zip`, "application/zip");
      } else downloadBlob(serializeVCards(converted.contacts, { version: outputVersion, preserveUnknown: false }), `${outputName}-converted.vcf`, "text/vcard;charset=utf-8");
      setWarnings(converted.warnings); setStatus(`Downloaded ${converted.contacts.length.toLocaleString()} contacts`);
      trackEvent("download_clicked", { tool_slug: mode, output_format: "vcf", contact_count_bucket: converted.contacts.length > 1000 ? "1000-plus" : converted.contacts.length > 100 ? "101-1000" : "0-100" });
    } else {
      const activeHeaders = headers.filter((header) => !isColumnExcluded(header));
      if (!activeHeaders.length) { setStatus("Keep at least one column selected before exporting"); return; }
      const outputRows = contactsToRows(contacts).map((row) => Object.fromEntries(activeHeaders.map((header) => [header, row[header] ?? ""])));
      if (mode === "vcf-to-csv") downloadBlob(rowsToCsv(outputRows), `${outputName}.csv`, "text/csv;charset=utf-8");
      else downloadBlob(rowsToXlsx(outputRows), `${outputName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      setStatus(`Downloaded ${outputRows.length.toLocaleString()} rows · ${activeHeaders.length} columns`);
      trackEvent("download_clicked", { tool_slug: mode, output_format: mode === "vcf-to-csv" ? "csv" : "xlsx", contact_count_bucket: outputRows.length > 1000 ? "1000-plus" : outputRows.length > 100 ? "101-1000" : "0-100" });
    }
  }

  function downloadMappingReport() {
    if (!isTabularInput || !headers.length) return;
    const mappingLines = headers.map((header) => `${header}\t${mapping[header] ?? "ignore"}`);
    const rejected = mappedContacts.warnings.length ? `\nRejected or review rows\n${mappedContacts.warnings.join("\n")}` : "";
    downloadBlob(["vCard Editor mapping report", `Source: ${fileName}`, `Sheet: ${sheetName || "n/a"}`, `Rows: ${rows.length}`, `Output version: ${outputVersion}`, `Output mode: ${outputMode}`, "", "Source column\tTarget field", ...mappingLines, rejected].join("\n"), `${outputName}-mapping-report.txt`, "text/plain;charset=utf-8");
  }

  function applyPreset(value: "generic" | "google" | "outlook") {
    setPreset(value);
    if (value === "generic") { setMapping(suggestMapping(headers)); return; }
    const next = suggestMapping(headers);
    headers.forEach((header) => {
      const normalized = header.toLowerCase().replace(/[_.-]+/g, " ");
      if (value === "google") {
        if (/given name|first name/.test(normalized)) next[header] = "firstName";
        if (/family name|last name/.test(normalized)) next[header] = "lastName";
        if (/phone.*value|phone 1/.test(normalized)) next[header] = "phone";
        if (/e mail.*value|email 1/.test(normalized)) next[header] = "email";
        if (/organization name|company/.test(normalized)) next[header] = "organisation";
        if (/notes/.test(normalized)) next[header] = "note";
        if (/labels|group/.test(normalized)) next[header] = "categories";
      } else {
        if (/^first name$/.test(normalized)) next[header] = "firstName";
        if (/^last name$/.test(normalized)) next[header] = "lastName";
        if (/mobile phone|business phone|home phone/.test(normalized)) next[header] = "phone";
        if (/e mail address|email/.test(normalized)) next[header] = "email";
        if (/company/.test(normalized)) next[header] = "organisation";
        if (/job title/.test(normalized)) next[header] = "title";
        if (/notes/.test(normalized)) next[header] = "note";
      }
    });
    setMapping(next);
  }

  function reset() { setFileName(""); setContacts([]); setRows([]); setHeaders([]); setMapping({}); setPreset("generic"); setWarnings([]); setStatus("Choose a file to begin"); setSheetName(""); setExcludedColumns(new Set()); }

  return <div className="conversion-card">
    <div className="conversion-toolbar"><span className="file-icon" aria-hidden="true">{config.inputKind === "xlsx" ? "XLS" : config.inputKind === "csv" ? "CSV" : "VCF"}</span><div><strong>{fileName || config.title}</strong><small aria-live="polite">{status}{sheetName ? ` · Sheet: ${sheetName}` : ""}</small></div>{fileName && <button className="secondary-button" onClick={reset}>Open another</button>}</div>
    {!fileName ? <div className="conversion-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) processFile(file); }}><div className="drop-icon" aria-hidden="true">↥</div><h2>Choose your {config.input}</h2><p>Files are read locally in your browser. Nothing is uploaded to convert it.</p><div className="drop-actions"><button className="primary-button" onClick={() => inputRef.current?.click()}>Choose {config.input}</button><button className="text-button" onClick={loadSample}>Try a sample</button></div><input ref={inputRef} aria-label={`Choose ${config.input}`} type="file" accept={config.accept} onChange={handleFile} hidden /><small>Output: {config.output}</small></div> : <>
      {isTabularInput && <section className="mapping-section"><div className="mapping-heading"><div><p className="eyebrow">MAP COLUMNS</p><h2>Tell us what each column means.</h2></div><div className="mapping-tools"><label>Preset<select value={preset} onChange={(event) => applyPreset(event.target.value as "generic" | "google" | "outlook")}><option value="generic">Generic CSV</option><option value="google">Google Contacts</option><option value="outlook">Outlook CSV</option></select></label><span>{headers.length} source columns</span></div></div><div className="mapping-grid">{headers.map((header) => <label key={header}><span>{header}</span><select value={mapping[header] ?? "ignore"} onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value as ContactColumn | "ignore" }))}><option value="ignore">Ignore this column</option>{CONTACT_COLUMNS.map((column) => <option value={column.key} key={column.key}>{column.label}</option>)}</select></label>)}</div><div className="conversion-options"><label>Output version<select value={outputVersion} onChange={(event) => setOutputVersion(event.target.value as KnownVCardVersion)}><option value="2.1">vCard 2.1</option><option value="3.0">vCard 3.0</option><option value="4.0">vCard 4.0</option></select></label><label>Output files<select value={outputMode} onChange={(event) => setOutputMode(event.target.value as "combined" | "individual")}><option value="combined">One multi-contact VCF</option><option value="individual">One VCF per row (ZIP)</option></select></label><button className="text-button" type="button" onClick={downloadMappingReport}>Download mapping report</button></div><p className="mapping-note">Phone and email columns can be repeated. Values are combined into the same contact. Rows without a name, phone, or email remain visible as warnings for review.</p></section>}
      <section className="preview-section"><div className="preview-heading"><div><p className="eyebrow">PREVIEW</p><h2>{isTabularInput ? `${mappedContacts.contacts.length.toLocaleString()} contacts after mapping` : `${contacts.length.toLocaleString()} contacts ready`}</h2></div><button className="primary-button compact" onClick={download}>Download {mode.includes("to-vcf") ? "VCF" : mode.endsWith("csv") ? "CSV" : "Excel"} <span>↓</span></button></div>{!isTabularInput && headers.length > 0 && <details className="column-picker"><summary>Export columns ({activeColumnCount} of {headers.length} selected)</summary><div className="mapping-grid">{headers.map((header) => { const base = columnBase(header); const checked = !excludedColumns.has(base); return <label key={base}><input type="checkbox" checked={checked} onChange={(event) => setExcludedColumns((current) => { const next = new Set(current); if (event.target.checked) next.delete(base); else next.add(base); return next; })} /> {base}</label>; })}</div></details>}<div className="preview-table-wrap"><table><thead><tr>{headers.slice(0, 8).map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{previewRows.map((row, index) => <tr key={index}>{headers.slice(0, 8).map((header) => <td key={header}>{row[header] || <span className="empty-cell">—</span>}</td>)}</tr>)}</tbody></table>{!previewRows.length && <p className="empty-preview">No rows to preview.</p>}</div></section>
      {warnings.length > 0 && <div className="conversion-warning"><strong>{warnings.length} warning{warnings.length === 1 ? "" : "s"}</strong>{warnings.slice(0, 3).map((warning) => <span key={warning}>{warning}</span>)}</div>}
    </>}
  </div>;
}
