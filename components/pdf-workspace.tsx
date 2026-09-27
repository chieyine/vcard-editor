"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import type { PdfFontSources } from "../lib/pdf";
import { decodeVCardBytes, parseVCard, type Contact } from "../lib/vcard";
import { downloadFile } from "../lib/download";
import { useLocalOperation } from "../lib/use-local-operation";

export default function PdfWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const operation = useLocalOperation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to create a PDF");
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setContacts([]);
    setStatus("Reading contacts…");
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const parsed = parseVCard(decodeVCardBytes(buffer).text);
      setContacts(parsed.contacts);
      setFileName(file.name);
      setStatus(
        `${parsed.contacts.length.toLocaleString()} contacts ready · ${parsed.issues.length} source warnings`,
      );
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not open the file.",
        );
        job.fail();
      }
    }
  }
  async function createPdf() {
    if (!contacts.length || operation.busy) return;
    const job = operation.begin();
    setStatus("Building PDF locally…");
    try {
      const scripts = [
        "latin",
        "latin-ext",
        "cyrillic",
        "cyrillic-ext",
        "greek",
        "greek-ext",
        "devanagari",
        "vietnamese",
      ];
      const load = (weight: 400 | 700) =>
        Promise.all(
          scripts.map(async (script) => {
            const response = await fetch(
              `/fonts/noto-sans-${script}-${weight}.woff2`,
              { signal: job.signal },
            );
            if (!response.ok)
              throw new Error(
                "A local PDF font could not be loaded. Reconnect and retry.",
              );
            return response.arrayBuffer();
          }),
        );
      const [{ contactsToPdf }, regular, bold] = await Promise.all([
        import("../lib/pdf"),
        load(400),
        load(700),
      ]);
      const fonts: PdfFontSources = { regular, bold };
      if (!job.current()) return;
      const bytes = await contactsToPdf(contacts, fonts, job.signal);
      if (!job.current()) return;
      downloadFile(
        bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer,
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.pdf`,
        "application/pdf",
      );
      setStatus("PDF created and download started");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not create the PDF.",
        );
        job.fail();
      }
    }
  }
  function reset() {
    operation.cancel();
    setContacts([]);
    setFileName("");
    setStatus("Choose a VCF file");
  }
  return (
    <div className="conversion-card">
      <div className="conversion-toolbar">
        <span className="file-icon">PDF</span>
        <div>
          <strong>{fileName || "VCF to PDF"}</strong>
          <small aria-live="polite">{status}</small>
        </div>
        {operation.busy ? (
          <button
            className="secondary-button"
            onClick={() => {
              operation.cancel();
              setStatus("Cancelled. No output downloaded.");
            }}
          >
            Cancel
          </button>
        ) : (
          contacts.length > 0 && (
            <button className="primary-button compact" onClick={createPdf}>
              Download PDF
            </button>
          )
        )}
        <button
          className="secondary-button"
          onClick={() => {
            reset();
            inputRef.current?.click();
          }}
        >
          {contacts.length ? "Open another" : "Choose VCF"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".vcf,.vcard,text/vcard"
          onChange={handleFile}
          hidden
          aria-label="Choose a VCF file"
        />
      </div>
      <section className="preview-section">
        <h2>Contact summary</h2>
        <p className="mapping-note">
          This summary shows the source contacts, not the final PDF layout. Long
          entries continue across pages. Fonts are checked before download;
          unsupported characters produce a clear error rather than disappearing.
          Up to 5,000 contacts per PDF.
        </p>
        <div className="contact-preview-grid">
          {contacts.slice(0, 6).map((contact) => (
            <article key={contact.id}>
              <strong>{contact.formattedName || "Unnamed contact"}</strong>
              <span>
                {contact.organisation ||
                  contact.emails[0] ||
                  contact.phones[0] ||
                  "No additional details"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
