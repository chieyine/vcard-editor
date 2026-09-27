"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import {
  decodeVCardBytes,
  KnownVCardVersion,
  parseVCard,
  serializeVCards,
} from "../lib/vcard";
import { repairVCardText } from "../lib/contact-tools";
import { useLocalOperation } from "../lib/use-local-operation";
import { assertTextBudget } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";

export default function VCardTransformWorkspace({
  mode,
}: {
  mode: "version" | "encoding";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const operation = useLocalOperation();
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [target, setTarget] = useState<KnownVCardVersion>("3.0");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to begin");
  const [repairs, setRepairs] = useState<string[]>([]);
  function run(text = input) {
    if (!text.trim()) {
      setStatus("Choose a VCF file or paste vCard text first");
      return;
    }
    try {
      assertTextBudget(text);
      if (mode === "encoding") {
        const result = repairVCardText(text, target);
        setOutput(result.output);
        setRepairs(result.repairs);
        setStatus(
          `${result.parsed.contacts.length.toLocaleString()} contacts repaired and ready`,
        );
      } else {
        const parsed = parseVCard(text);
        setOutput(
          serializeVCards(parsed.contacts, {
            version: target,
            preserveUnknown: true,
            includePhotos: true,
          }),
        );
        setRepairs([
          `Converted ${parsed.contacts.length.toLocaleString()} contacts to vCard ${target}.`,
          ...parsed.warnings,
        ]);
        setStatus(
          `${parsed.contacts.length.toLocaleString()} contacts converted to vCard ${target}`,
        );
      }
      trackEvent("tool_run_succeeded", {
        tool_slug:
          mode === "version" ? "vcard-version-converter" : "vcf-encoding-fixer",
        output_format: "vcf",
      });
    } catch {
      setOutput("");
      setStatus(
        "The VCF could not be processed. The original remains unchanged.",
      );
      trackEvent("tool_run_failed", {
        tool_slug:
          mode === "version" ? "vcard-version-converter" : "vcf-encoding-fixer",
        error_code: "invalid-vcf",
      });
    }
  }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setInput("");
    setOutput("");
    setRepairs([]);
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const text = decodeVCardBytes(buffer).text;
      assertTextBudget(text);
      setInput(text);
      setFileName(file.name);
      setStatus("File loaded. Process to review the result.");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not open that file.",
        );
        job.fail();
      }
    }
  }

  function download() {
    const blob = new Blob([output], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-${mode === "encoding" ? "encoding-fixed" : `v${target}`}.vcf`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackEvent("download_clicked", {
      tool_slug:
        mode === "version" ? "vcard-version-converter" : "vcf-encoding-fixer",
      output_format: "vcf",
    });
  }
  return (
    <div className="conversion-card">
      <div className="conversion-toolbar">
        <span className="file-icon">VCF</span>
        <div>
          <strong>
            {fileName ||
              (mode === "version"
                ? "vCard Version Converter"
                : "VCF Encoding Fixer")}
          </strong>
          <small aria-live="polite">{status}</small>
        </div>
        {output && (
          <button className="primary-button compact" onClick={download}>
            Download VCF <span>↓</span>
          </button>
        )}
      </div>
      <div className="mapping-section">
        <div className="mapping-heading">
          <div>
            <p className="eyebrow">
              {mode === "version" ? "VERSION CONVERTER" : "ENCODING FIXER"}
            </p>
            <h2>
              {mode === "version"
                ? "Choose a compatible output version."
                : "Repair common encoding and line-ending problems."}
            </h2>
          </div>
          <label className="mapping-tools">
            Target version
            <select
              value={target}
              onChange={(event) => {
                setTarget(event.target.value as KnownVCardVersion);
                setOutput("");
                setRepairs([]);
              }}
            >
              <option value="2.1">vCard 2.1</option>
              <option value="3.0">vCard 3.0</option>
              <option value="4.0">vCard 4.0</option>
            </select>
          </label>
        </div>
        <textarea
          className="standards-input"
          aria-label="Source vCard"
          maxLength={2 * 1024 * 1024}
          value={input}
          onChange={(event) => {
            operation.cancel();
            setInput(event.target.value);
            setOutput("");
            setRepairs([]);
          }}
          rows={11}
          placeholder="Paste vCard text or choose a file"
          spellCheck={false}
        />
        <p className="mapping-note">
          Version conversion rewrites syntax. Vendor properties are retained,
          but destination-specific compatibility still needs review. Keep the
          original file.
        </p>
        <div className="export-actions">
          <button
            className="secondary-button"
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
          <button className="primary-button compact" onClick={() => run()}>
            Process locally <span>→</span>
          </button>
        </div>
      </div>
      {repairs.length > 0 && (
        <section className="operation-section">
          <div className="operation-heading">
            <div>
              <p className="eyebrow">CHANGE SUMMARY</p>
              <h2>
                {repairs.length} item{repairs.length === 1 ? "" : "s"} recorded
              </h2>
            </div>
          </div>
          <div className="issue-list">
            {repairs.map((repair, index) => (
              <div key={`${repair}-${index}`}>
                <span className="issue-severity issue-warning">info</span>
                <span>{repair}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {output && (
        <section className="preview-section">
          <div className="preview-heading">
            <div>
              <p className="eyebrow">OUTPUT PREVIEW</p>
              <h2>Ready to download</h2>
            </div>
          </div>
          <textarea
            className="standards-output"
            aria-label="Converted vCard"
            value={output}
            readOnly
            rows={10}
            spellCheck={false}
          />
        </section>
      )}
    </div>
  );
}
