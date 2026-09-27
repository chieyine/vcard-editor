"use client";

import { ChangeEvent, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import {
  convertStandards,
  standardsWarnings,
  StandardsFormat,
} from "../lib/standards";
import { useLocalOperation } from "../lib/use-local-operation";
import { decodeVCardBytes } from "../lib/vcard";
import { downloadFile } from "../lib/download";
import { trackEvent } from "../lib/analytics";

type StandardsMode = `${"from-vcard" | "to-vcard"}-${StandardsFormat}`;

const labels: Record<
  StandardsMode,
  { title: string; input: string; output: string; accept: string }
> = {
  "from-vcard-json": {
    title: "VCF to JSON",
    input: "VCF file",
    output: "JSON contact data",
    accept: ".vcf,.vcard,text/vcard",
  },
  "to-vcard-json": {
    title: "JSON to VCF",
    input: "JSON contact data",
    output: "VCF file",
    accept: ".json,application/json",
  },
  "from-vcard-jscontact": {
    title: "vCard to JSContact",
    input: "VCF file",
    output: "JSContact JSON",
    accept: ".vcf,.vcard,text/vcard",
  },
  "to-vcard-jscontact": {
    title: "JSContact to vCard",
    input: "JSContact JSON",
    output: "VCF file",
    accept: ".json,application/json",
  },
  "from-vcard-jcard": {
    title: "vCard to jCard",
    input: "VCF file",
    output: "jCard JSON",
    accept: ".vcf,.vcard,text/vcard",
  },
  "to-vcard-jcard": {
    title: "jCard to vCard",
    input: "jCard JSON",
    output: "VCF file",
    accept: ".json,application/json",
  },
  "from-vcard-xcard": {
    title: "vCard to xCard",
    input: "VCF file",
    output: "xCard XML",
    accept: ".vcf,.vcard,text/vcard",
  },
  "to-vcard-xcard": {
    title: "xCard to vCard",
    input: "xCard XML",
    output: "VCF file",
    accept: ".xml,application/xml,text/xml",
  },
  "from-vcard-ldif": {
    title: "VCF to LDIF",
    input: "VCF file",
    output: "LDIF directory file",
    accept: ".vcf,.vcard,text/vcard",
  },
  "to-vcard-ldif": {
    title: "LDIF to vCard",
    input: "LDIF file",
    output: "VCF file",
    accept: ".ldif,.ldi,text/ldif",
  },
};

export default function StandardsWorkspace({ mode }: { mode: StandardsMode }) {
  const operation = useLocalOperation();
  const [warnings, setWarnings] = useState<string[]>([]);
  const config = labels[mode];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Paste data or choose a file to begin");
  const inputRef = useRef<HTMLInputElement>(null);
  const actualDirection = mode.startsWith("from-vcard-")
    ? "from-vcard"
    : "to-vcard";
  const format = mode.replace(/^(from-vcard|to-vcard)-/, "") as StandardsFormat;

  function convert(value = input) {
    if (!value.trim()) {
      setStatus("Add some source data first");
      return;
    }
    try {
      const next = convertStandards(value, actualDirection, format);
      setOutput(next);
      setWarnings(standardsWarnings(value, actualDirection, format));
      setStatus("Converted · review the result before downloading");
      trackEvent("tool_run_succeeded", {
        tool_slug: `vcard-${format}`,
        input_format: actualDirection === "from-vcard" ? "vcf" : format,
        output_format: actualDirection === "from-vcard" ? format : "vcf",
      });
    } catch (error) {
      setOutput("");
      setStatus(
        error instanceof Error ? error.message : "Could not parse the source.",
      );
      trackEvent("tool_run_failed", {
        tool_slug: `vcard-${format}`,
        error_code: "invalid-source",
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
    setWarnings([]);
    setStatus("Reading source…");
    try {
      const guard = guardFile(
        file,
        actualDirection === "from-vcard"
          ? [".vcf", ".vcard"]
          : format === "ldif"
            ? [".ldif", ".ldi"]
            : format === "xcard"
              ? [".xml"]
              : [".json"],
      );
      if (!guard.ok) throw new Error(guard.message);
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Specialist conversions accept up to 5 MB per file.");
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const source =
        actualDirection === "from-vcard"
          ? decodeVCardBytes(buffer).text
          : new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      setInput(source);
      setFileName(file.name);
      setStatus("Source loaded. Convert to review the result.");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read the source.",
        );
        job.fail();
      }
    }
  }

  function download() {
    if (!output) return;
    const extension =
      actualDirection === "from-vcard"
        ? format === "xcard"
          ? "xml"
          : format === "ldif"
            ? "ldif"
            : "json"
        : "vcf";
    const blob = new Blob([output], {
      type:
        extension === "json"
          ? "application/json"
          : extension === "xml"
            ? "application/xml"
            : extension === "ldif"
              ? "text/ldif"
              : "text/vcard",
    });
    downloadFile(
      blob,
      `${fileName.replace(/\.[^.]+$/, "") || "contacts"}.${extension}`,
      blob.type,
    );
    trackEvent("download_clicked", {
      tool_slug: `vcard-${format}`,
      output_format: extension,
    });
  }

  return (
    <div className="conversion-card">
      <div className="conversion-toolbar">
        <span className="file-icon" aria-hidden="true">
          {format.toUpperCase()}
        </span>
        <div>
          <strong>{fileName || config.title}</strong>
          <small aria-live="polite">{status}</small>
        </div>
        {output && (
          <button className="primary-button compact" onClick={download}>
            Download {config.output} <span>↓</span>
          </button>
        )}
      </div>
      <div className="mapping-section">
        <div className="mapping-heading">
          <div>
            <p className="eyebrow">LOCAL CONVERSION</p>
            <h2>
              {config.input} → {config.output}
            </h2>
          </div>
          <button
            className="secondary-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={config.accept}
            onChange={handleFile}
            hidden
          />
        </div>
        <textarea
          className="standards-input"
          aria-label="Source data"
          maxLength={2 * 1024 * 1024}
          value={input}
          onChange={(event) => {
            operation.cancel();
            setInput(event.target.value);
            setOutput("");
            setWarnings([]);
          }}
          placeholder={`Paste ${config.input} here`}
          rows={12}
          spellCheck={false}
        />
        <div className="export-actions">
          <button className="primary-button compact" onClick={() => convert()}>
            Convert locally <span>→</span>
          </button>
          {output && (
            <button className="text-button" onClick={download}>
              Download result
            </button>
          )}
        </div>
      </div>
      <p className="mapping-note">
        Beta · limited field subset. The output preview and conversion notes
        show what will be exported. Keep the source file.
      </p>
      {warnings.length > 0 && (
        <div className="conversion-warning">
          {warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      )}
      {output && (
        <section className="preview-section">
          <div className="preview-heading">
            <div>
              <p className="eyebrow">OUTPUT PREVIEW</p>
              <h2>{config.output}</h2>
            </div>
          </div>
          <textarea
            className="standards-output"
            aria-label="Converted data"
            value={output}
            readOnly
            rows={12}
            spellCheck={false}
          />
        </section>
      )}
    </div>
  );
}
