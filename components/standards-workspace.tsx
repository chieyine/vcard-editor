"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { convertStandards, standardsContactCount, StandardsFormat } from "../lib/standards";
import { trackEvent } from "../lib/analytics";

type StandardsMode = `${"from-vcard" | "to-vcard"}-${StandardsFormat}`;

const labels: Record<StandardsMode, { title: string; input: string; output: string; accept: string }> = {
  "from-vcard-json": { title: "VCF to JSON", input: "VCF file", output: "JSON contact data", accept: ".vcf,.vcard,text/vcard" },
  "to-vcard-json": { title: "JSON to VCF", input: "JSON contact data", output: "VCF file", accept: ".json,application/json" },
  "from-vcard-jscontact": { title: "vCard to JSContact", input: "VCF file", output: "JSContact JSON", accept: ".vcf,.vcard,text/vcard" },
  "to-vcard-jscontact": { title: "JSContact to vCard", input: "JSContact JSON", output: "VCF file", accept: ".json,application/json" },
  "from-vcard-jcard": { title: "vCard to jCard", input: "VCF file", output: "jCard JSON", accept: ".vcf,.vcard,text/vcard" },
  "to-vcard-jcard": { title: "jCard to vCard", input: "jCard JSON", output: "VCF file", accept: ".json,application/json" },
  "from-vcard-xcard": { title: "vCard to xCard", input: "VCF file", output: "xCard XML", accept: ".vcf,.vcard,text/vcard" },
  "to-vcard-xcard": { title: "xCard to vCard", input: "xCard XML", output: "VCF file", accept: ".xml,application/xml,text/xml" },
  "from-vcard-ldif": { title: "VCF to LDIF", input: "VCF file", output: "LDIF directory file", accept: ".vcf,.vcard,text/vcard" },
  "to-vcard-ldif": { title: "LDIF to vCard", input: "LDIF file", output: "VCF file", accept: ".ldif,.ldi,text/ldif" },
};

export default function StandardsWorkspace({ mode }: { mode: StandardsMode }) {
  const config = labels[mode];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Paste data or choose a file to begin");
  const inputRef = useRef<HTMLInputElement>(null);
  const actualDirection = mode.startsWith("from-vcard-") ? "from-vcard" : "to-vcard";
  const format = mode.replace(/^(from-vcard|to-vcard)-/, "") as StandardsFormat;

  function convert(value = input) {
    if (!value.trim()) { setStatus("Add some source data first"); return; }
    try {
      const next = convertStandards(value, actualDirection, format);
      setOutput(next);
      setStatus(`${standardsContactCount(value, actualDirection, format)} contact-count bucket · ready to download`);
      trackEvent("tool_run_succeeded", { tool_slug: `vcard-${format}`, input_format: actualDirection === "from-vcard" ? "vcf" : format, output_format: actualDirection === "from-vcard" ? format : "vcf" });
    } catch {
      setOutput("");
      setStatus("The source could not be parsed. Check its format and try again.");
      trackEvent("tool_run_failed", { tool_slug: `vcard-${format}`, error_code: "invalid-source" });
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const guard = guardFile(file, actualDirection === "from-vcard" ? [".vcf", ".vcard"] : format === "ldif" ? [".ldif", ".ldi"] : format === "xcard" ? [".xml"] : [".json"]);
    if (!guard.ok) { setStatus(guard.message); return; }
    trackEvent("file_selected", { tool_slug: `vcard-${format}`, input_format: actualDirection === "from-vcard" ? "vcf" : format, size_bucket: file.size > 8 * 1024 * 1024 ? "large" : "standard" });
    const reader = new FileReader();
    reader.onload = () => { const text = typeof reader.result === "string" ? reader.result : ""; setInput(text); setFileName(file.name); convert(text); };
    reader.onerror = () => setStatus("Could not read that file");
    reader.readAsText(file);
  }

  function download() {
    if (!output) return;
    const extension = actualDirection === "from-vcard" ? format === "xcard" ? "xml" : format === "ldif" ? "ldif" : "json" : "vcf";
    const blob = new Blob([output], { type: extension === "json" ? "application/json" : extension === "xml" ? "application/xml" : extension === "ldif" ? "text/ldif" : "text/vcard" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${fileName.replace(/\.[^.]+$/, "") || "contacts"}.${extension}`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackEvent("download_clicked", { tool_slug: `vcard-${format}`, output_format: extension });
  }

  return <div className="conversion-card">
    <div className="conversion-toolbar"><span className="file-icon" aria-hidden="true">{format.toUpperCase()}</span><div><strong>{fileName || config.title}</strong><small aria-live="polite">{status}</small></div>{output && <button className="primary-button compact" onClick={download}>Download {config.output} <span>↓</span></button>}</div>
    <div className="mapping-section"><div className="mapping-heading"><div><p className="eyebrow">LOCAL CONVERSION</p><h2>{config.input} → {config.output}</h2></div><button className="secondary-button" onClick={() => inputRef.current?.click()}>Choose file</button><input ref={inputRef} type="file" accept={config.accept} onChange={handleFile} hidden /></div><textarea className="standards-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Paste ${config.input} here`} rows={12} spellCheck={false} /><div className="export-actions"><button className="primary-button compact" onClick={() => convert()}>Convert locally <span>→</span></button>{output && <button className="text-button" onClick={download}>Download result</button>}</div></div>
    {output && <section className="preview-section"><div className="preview-heading"><div><p className="eyebrow">OUTPUT PREVIEW</p><h2>{config.output}</h2></div></div><textarea className="standards-output" value={output} readOnly rows={12} spellCheck={false} /></section>}
  </div>;
}
