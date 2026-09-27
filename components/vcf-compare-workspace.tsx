"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { decodeVCardBytes, parseVCard, type Contact } from "../lib/vcard";
import { compareContacts } from "../lib/compare";
import { downloadFile } from "../lib/download";
import { useLocalOperation } from "../lib/use-local-operation";

type Side = { name: string; contacts: Contact[] };
export default function VcfCompareWorkspace() {
  const [left, setLeft] = useState<Side | null>(null);
  const [right, setRight] = useState<Side | null>(null);
  const [status, setStatus] = useState("Choose two VCF files to compare");
  const leftOperation = useLocalOperation();
  const rightOperation = useLocalOperation();
  const comparison = useMemo(
    () =>
      left && right ? compareContacts(left.contacts, right.contacts) : null,
    [left, right],
  );
  async function select(
    side: "left" | "right",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const setSide = side === "left" ? setLeft : setRight;
    const job = (side === "left" ? leftOperation : rightOperation).begin();
    setSide(null);
    setStatus("Reading backup…");
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      if (file.size > 5 * 1024 * 1024)
        throw new Error(
          "Use a file up to 5 MB here, or open a larger file in the editor.",
        );
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const parsed = parseVCard(decodeVCardBytes(buffer).text);
      setSide({ name: file.name, contacts: parsed.contacts });
      setStatus(`Backup loaded · ${parsed.issues.length} source warnings`);
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
  const lines = comparison
    ? [
        `Original: ${comparison.before} contacts · Newer: ${comparison.after} contacts`,
        `${comparison.unchanged} unchanged · ${comparison.changed.length} changed · ${comparison.added.length} added · ${comparison.removed.length} removed · ${comparison.ambiguous.length} ambiguous groups`,
        ...comparison.changed.map(
          (item) =>
            `Changed: ${item.after.formattedName || "Unnamed contact"} — ${item.fields.join(", ")}`,
        ),
        ...comparison.added.map(
          (contact) => `Added: ${contact.formattedName || "Unnamed contact"}`,
        ),
        ...comparison.removed.map(
          (contact) => `Removed: ${contact.formattedName || "Unnamed contact"}`,
        ),
        ...comparison.ambiguous.map(
          (item) =>
            `Ambiguous: ${item.label} — ${item.before} original / ${item.after} newer occurrences`,
        ),
      ]
    : [];
  return (
    <div className="comparison-card">
      <div className="comparison-toolbar">
        <div>
          <strong>Compare two VCF files</strong>
          <small aria-live="polite">{status}</small>
        </div>
        {comparison && (
          <button
            className="primary-button compact"
            onClick={() =>
              downloadFile(
                [
                  "VCF comparison report",
                  "Identity: UID, otherwise email set, otherwise phone set, otherwise name. All properties are compared; duplicate occurrences are retained.",
                  ...lines,
                ].join("\n"),
                "vcf-comparison-report.txt",
                "text/plain;charset=utf-8",
              )
            }
          >
            Download report
          </button>
        )}
      </div>
      <div className="comparison-pickers">
        <label className="comparison-picker">
          <span>Original backup</span>
          <strong>{left?.name || "Choose first VCF"}</strong>
          <input
            type="file"
            accept=".vcf,.vcard"
            onChange={(event) => select("left", event)}
          />
        </label>
        <label className="comparison-picker">
          <span>Newer backup</span>
          <strong>{right?.name || "Choose second VCF"}</strong>
          <input
            type="file"
            accept=".vcf,.vcard"
            onChange={(event) => select("right", event)}
          />
        </label>
      </div>
      <p className="mapping-note">
        Matches by UID, otherwise email set, phone set, then name. Changes to
        identity fields can appear as added/removed. Duplicate occurrences are
        counted; uncertain pairings are shown as ambiguous. Property order and
        line folding are ignored.
      </p>
      {comparison && (
        <section className="operation-section">
          <h2>Comparison preview</h2>
          <div className="issue-list">
            {lines.slice(0, 102).map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          {lines.length > 102 && (
            <p>
              Showing the first 100 differences. Download the full report for
              all {lines.length - 2} entries.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
