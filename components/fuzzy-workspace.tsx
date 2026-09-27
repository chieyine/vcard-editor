"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useLocalOperation } from "../lib/use-local-operation";
import { guardFile } from "../lib/file-guard";
import { findFuzzyMatches } from "../lib/fuzzy";
import { decodeVCardBytes, parseVCard, type Contact } from "../lib/vcard";

function download(value: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([value], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function summary(contact: Contact) {
  return [
    contact.formattedName || "Unnamed contact",
    contact.organisation,
    contact.phones.join(", "),
    contact.emails.join(", "),
  ].filter(Boolean);
}

export default function FuzzyWorkspace() {
  const operation = useLocalOperation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fileName, setFileName] = useState("");
  const [threshold, setThreshold] = useState(0.72);
  const [status, setStatus] = useState("Choose a VCF file");
  const result = useMemo(
    () => findFuzzyMatches(contacts, threshold),
    [contacts, threshold],
  );
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setContacts([]);
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Fuzzy review accepts up to 5 MB at a time.");
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const parsed = parseVCard(decodeVCardBytes(buffer).text);
      if (parsed.contacts.length > 10000)
        throw new Error("Review at most 10,000 contacts at a time.");
      setContacts(parsed.contacts);
      setFileName(file.name);
      setStatus(
        `${parsed.contacts.length.toLocaleString()} contacts ready for similarity review`,
      );
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read that file.",
        );
        job.fail();
      }
    }
  }

  function exportReport() {
    const report = [
      "Fuzzy contact match review",
      `Contacts: ${contacts.length}`,
      `Threshold: ${Math.round(threshold * 100)}%`,
      `Candidate comparisons: ${result.comparisons}`,
      `Comparison cap reached: ${result.capped}`,
      `Buckets truncated at 200 contacts: ${result.truncatedBuckets}`,
      "",
      ...result.matches.flatMap((match, index) => [
        `${index + 1}. ${match.score}% · ${match.reasons.join(", ") || "combined similarity"}`,
        `   A: ${summary(match.left).join(" · ")}`,
        `   B: ${summary(match.right).join(" · ")}`,
        "",
      ]),
    ].join("\n");
    download(
      report,
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-fuzzy-matches.txt`,
    );
  }
  return (
    <div className="conversion-card">
      <div className="conversion-toolbar">
        <span className="file-icon" aria-hidden="true">
          ≈
        </span>
        <div>
          <strong>{fileName || "Fuzzy contact matcher"}</strong>
          <small aria-live="polite">{status}</small>
        </div>
        {contacts.length > 0 && (
          <button className="primary-button compact" onClick={exportReport}>
            Download report <span>↓</span>
          </button>
        )}
      </div>
      {!contacts.length ? (
        <div className="conversion-dropzone">
          <div className="drop-icon" aria-hidden="true">
            ↥
          </div>
          <h2>Find likely duplicate contacts</h2>
          <p>
            Candidate blocking avoids an expensive all-pairs scan. Nothing is
            merged automatically.
          </p>
          <button
            className="primary-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose VCF
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
      ) : (
        <section className="preview-section">
          <button
            className="secondary-button"
            onClick={() => {
              operation.cancel();
              setContacts([]);
              setFileName("");
            }}
          >
            Open another
          </button>
          <div className="preview-heading">
            <div>
              <p className="eyebrow">REVIEW-FIRST MATCHES</p>
              <h2>{result.matches.length.toLocaleString()} possible pairs</h2>
            </div>
            <label className="mapping-tools">
              Sensitivity
              <select
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              >
                <option value={0.82}>Conservative</option>
                <option value={0.72}>Balanced</option>
                <option value={0.64}>Broad review</option>
              </select>
            </label>
          </div>
          {(result.capped || result.truncatedBuckets > 0) && (
            <div className="conversion-warning">
              <strong>Candidate limit reached</strong>
              <span>
                The review is incomplete:{" "}
                {result.capped ? "50,000-comparison cap reached. " : ""}
                {result.truncatedBuckets} candidate buckets exceeded 200
                contacts. Split the file into smaller groups for a fuller
                review; changing sensitivity does not restore omitted
                candidates.
              </span>
            </div>
          )}
          <p className="mapping-note">
            Showing up to 100 pairs. The download includes every returned match.
          </p>
          <div className="match-list">
            {result.matches.slice(0, 100).map((match) => (
              <article key={`${match.left.id}-${match.right.id}`}>
                <header>
                  <strong>{match.score}% similarity</strong>
                  <span>
                    {match.reasons.join(" · ") || "combined similarity"}
                  </span>
                </header>
                <div>
                  <section>
                    {summary(match.left).map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </section>
                  <b aria-hidden="true">⇄</b>
                  <section>
                    {summary(match.right).map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </section>
                </div>
              </article>
            ))}
            {!result.matches.length && (
              <p className="empty-preview">
                No candidate pairs met this threshold.
              </p>
            )}
          </div>
          <p className="mapping-note">
            Name, organization and email-name similarity uses the first 128
            characters. Scores are review signals, not identity claims. Shared
            household numbers and similar names can belong to different people.
          </p>
        </section>
      )}
    </div>
  );
}
