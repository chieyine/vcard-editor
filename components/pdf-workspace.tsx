"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { contactsToPdf, type PdfFontSources } from "../lib/pdf";
import { decodeVCardBytes, parseVCard, type Contact } from "../lib/vcard";

function download(content: BlobPart, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/pdf" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PdfWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to create a PDF");
  const [busy, setBusy] = useState(false);
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const guard = guardFile(file, [".vcf", ".vcard"]); if (!guard.ok) { setStatus(guard.message); return; }
    const reader = new FileReader(); reader.onload = () => { if (!(reader.result instanceof ArrayBuffer)) return; const parsed = parseVCard(decodeVCardBytes(reader.result).text); setContacts(parsed.contacts); setFileName(file.name); setStatus(`${parsed.contacts.length.toLocaleString()} contacts ready · ${parsed.issues.length} warnings`); }; reader.onerror = () => setStatus("That file could not be read."); reader.readAsArrayBuffer(file);
  }
  async function createPdf() {
    if (!contacts.length || busy) return; setBusy(true); setStatus("Building PDF locally…");
    try {
      const scripts = ["latin-ext", "cyrillic-ext", "greek-ext", "devanagari", "vietnamese"];
      const load = async (weight: 400 | 700) => Promise.all(scripts.map(async (script) => {
        const response = await fetch(`/fonts/noto-sans-${script}-${weight}.woff2`);
        if (!response.ok) throw new Error("The embedded PDF font could not be loaded.");
        return response.arrayBuffer();
      }));
      const fontSources: PdfFontSources = { regular: await load(400), bold: await load(700) };
      const bytes = await contactsToPdf(contacts, fontSources); const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; download(buffer, `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.pdf`); setStatus(`Downloaded a ${contacts.length.toLocaleString()}-contact PDF`);
    }
    catch { setStatus("The PDF could not be created. Your original file is unchanged."); }
    finally { setBusy(false); }
  }
  return <div className="conversion-card"><div className="conversion-toolbar"><span className="file-icon" aria-hidden="true">PDF</span><div><strong>{fileName || "VCF to PDF"}</strong><small aria-live="polite">{status}</small></div>{contacts.length > 0 && <button className="primary-button compact" onClick={createPdf} disabled={busy}>{busy ? "Creating…" : "Download PDF"} <span>↓</span></button>}</div>{!contacts.length ? <div className="conversion-dropzone"><div className="drop-icon" aria-hidden="true">↥</div><h2>Create a real PDF contact directory</h2><p>The PDF is generated entirely in this browser. The contact file is never uploaded.</p><button className="primary-button" onClick={() => inputRef.current?.click()}>Choose VCF <span>⌘</span></button><input ref={inputRef} type="file" accept=".vcf,.vcard,text/vcard" onChange={handleFile} hidden aria-label="Choose a VCF file" /></div> : <section className="preview-section"><div className="preview-heading"><div><p className="eyebrow">PDF PREVIEW</p><h2>{contacts.length.toLocaleString()} contacts</h2></div><button className="secondary-button" onClick={() => { setContacts([]); setFileName(""); }}>Open another</button></div><div className="contact-preview-grid">{contacts.slice(0, 6).map((contact) => <article key={contact.id}><strong>{contact.formattedName || "Unnamed contact"}</strong><span>{contact.organisation || contact.emails[0] || contact.phones[0] || "No additional details"}</span></article>)}</div><p className="mapping-note">The print-ready PDF embeds local Noto Sans subsets for Latin, Cyrillic, Greek, Devanagari, and Vietnamese names. Nothing is uploaded.</p></section>}</div>;
}
