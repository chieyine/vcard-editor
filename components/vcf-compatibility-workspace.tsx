"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { decodeVCardBytes, parseVCard } from "../lib/vcard";
import { validateContacts } from "../lib/contact-tools";
import { useLocalOperation } from "../lib/use-local-operation";

export default function VcfCompatibilityWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const operation = useLocalOperation();
  const [report, setReport] = useState<string[]>([]);
  const [status, setStatus] = useState(
    "Choose a VCF file to inspect its syntax",
  );
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setReport([]);
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      if (file.size > 5 * 1024 * 1024)
        throw new Error(
          "Use a file up to 5 MB here, or open a larger file in the editor.",
        );
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const decoded = decodeVCardBytes(buffer);
      const parsed = parseVCard(decoded.text);
      const issues = validateContacts(parsed.contacts, parsed);
      setReport([
        `File: ${file.name}`,
        `Contacts: ${parsed.contacts.length}`,
        `Versions: ${
          Object.entries(parsed.versions)
            .map(([version, count]) => `${count} v${version}`)
            .join(" · ") || "none"
        }`,
        `Encoding: ${decoded.encoding}`,
        `Warnings: ${issues.length}`,
        ...issues.slice(0, 100).map((issue) => issue.message),
      ]);
      setStatus("Syntax report ready");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read the file.",
        );
        job.fail();
      }
    }
  }
  return (
    <div className="compatibility-card">
      <div className="conversion-toolbar">
        <span className="file-icon">VCF</span>
        <div>
          <strong>VCF syntax report</strong>
          <small aria-live="polite">{status}</small>
        </div>
      </div>
      <div className="operation-section">
        <button
          className="primary-button"
          onClick={() => inputRef.current?.click()}
        >
          Choose VCF
        </button>
        <input
          ref={inputRef}
          aria-label="Choose VCF"
          type="file"
          accept=".vcf,.vcard,text/vcard"
          onChange={handleFile}
          hidden
        />
        <p className="mapping-note">
          Checks local vCard syntax and field signals. This report does not
          certify Google, Apple, Outlook or Android imports. Keep the source and
          inspect a small import in your destination app.
        </p>
      </div>
      {report.length > 0 && (
        <section className="operation-section">
          <div className="issue-list">
            {report.map((item, index) => (
              <div key={index}>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
