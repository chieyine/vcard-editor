"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { foldVCardLines, generateSyntheticVCards, unfoldVCardLines } from "../lib/vcard-text-tools";

function download(content: string, name: string, type: string) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }

export default function VCardTextToolsWorkspace({ mode }: { mode: "folder" | "unfolder" | "generator" }) {
  const [input, setInput] = useState(""); const [count, setCount] = useState(25); const [version, setVersion] = useState<"2.1" | "3.0" | "4.0">("3.0");
  const output = useMemo(() => mode === "folder" ? foldVCardLines(input) : mode === "unfolder" ? unfoldVCardLines(input) : generateSyntheticVCards(count, version), [count, input, mode, version]);
  return <div className="creator-card"><div className="creator-toolbar"><span className="file-icon">VCF</span><div><strong>{mode === "folder" ? "vCard line folder" : mode === "unfolder" ? "vCard line unfolder" : "vCard test-data generator"}</strong><small>All processing stays in your browser.</small></div><button className="primary-button compact" onClick={() => { download(output, mode === "generator" ? "synthetic-contacts.vcf" : `${mode}-vcard.txt`, "text/plain;charset=utf-8"); trackEvent("download_clicked", { tool_slug: `vcard-${mode}`, output_format: "vcf" }); }} disabled={mode !== "generator" && !input}>Download <span>↓</span></button></div>{mode === "generator" ? <section className="creator-form"><div className="form-grid"><label>Number of contacts<input type="number" min={1} max={10000} value={count} onChange={(event) => setCount(Number(event.target.value) || 1)} /></label><label>Version<select value={version} onChange={(event) => setVersion(event.target.value as typeof version)}><option value="2.1">vCard 2.1</option><option value="3.0">vCard 3.0</option><option value="4.0">vCard 4.0</option></select></label></div><pre className="text-tool-preview">{output}</pre></section> : <section className="creator-form"><label>Input vCard text<textarea value={input} onChange={(event) => setInput(event.target.value)} rows={12} spellCheck={false} placeholder="Paste folded or unfolded vCard text" /></label><label>Output preview<textarea value={output} readOnly rows={12} spellCheck={false} /></label></section>}</div>;
}
