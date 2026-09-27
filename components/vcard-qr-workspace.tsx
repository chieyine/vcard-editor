"use client";

import { downloadFile as download } from "../lib/download";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { zipSync } from "fflate";
import { trackEvent } from "../lib/analytics";
import { useLocalOperation } from "../lib/use-local-operation";
import { guardFile } from "../lib/file-guard";
import { qrToSvg, type QrErrorCorrection } from "../lib/qr";
import {
  decodeVCardBytes,
  parseVCard,
  serializeVCards,
  joinStructuredValue,
  type Contact,
} from "../lib/vcard";

const escapeText = (value: string) => joinStructuredValue([value]);
const sampleVcf =
  "BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL:+234 801 234 5678\nEMAIL:ada@example.test\nEND:VCARD";

export default function VCardQrWorkspace({
  mode,
}: {
  mode: "single" | "batch";
}) {
  const operation = useLocalOperation();
  const [batch, setBatch] = useState<Contact[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganization] = useState("");
  const [errorCorrection, setErrorCorrection] =
    useState<QrErrorCorrection>("L");
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Create a contact or choose a VCF file");
  const contactText = useMemo(
    () =>
      `BEGIN:VCARD\nVERSION:3.0\nN:${joinStructuredValue([lastName, firstName, "", "", ""])}\nFN:${escapeText([firstName, lastName].filter(Boolean).join(" "))}\n${phone ? `TEL;TYPE=CELL:${escapeText(phone)}\n` : ""}${email ? `EMAIL;TYPE=INTERNET:${escapeText(email)}\n` : ""}${organisation ? `ORG:${escapeText(organisation)}\n` : ""}END:VCARD`,
    [firstName, lastName, phone, email, organisation],
  );
  const qr = useMemo(() => {
    if (mode !== "single" || (!firstName && !lastName && !phone && !email))
      return { svg: "", error: "" };
    try {
      return { svg: qrToSvg(contactText, 5, 4, errorCorrection), error: "" };
    } catch {
      return {
        svg: "",
        error:
          "This contact is too large for a QR code. Shorten the details or lower error correction.",
      };
    }
  }, [contactText, errorCorrection, email, firstName, lastName, mode, phone]);
  const svg = qr.svg;
  const parsed = { contacts: batch };

  function loadSample() {
    operation.cancel();
    setBatch(parseVCard(sampleVcf).contacts);
    if (mode === "batch") {
      setRaw(sampleVcf);
      setFileName("sample-contacts.vcf");
    }
    setFirstName("Ada");
    setLastName("Okafor");
    setPhone("+234 801 234 5678");
    setEmail("ada@example.test");
    setOrganization("Northstar Studio");
    setStatus("QR preview ready");
    trackEvent("sample_loaded", {
      tool_slug: mode === "single" ? "vcard-qr-code" : "vcf-to-qr-codes",
      source: "sample",
    });
  }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setBatch([]);
    setRaw("");
    setStatus("Reading contacts…");
    try {
      const guard = guardFile(file, [".vcf", ".vcard"]);
      if (!guard.ok) throw new Error(guard.message);
      if (file.size > 1024 * 1024)
        throw new Error("QR batches are limited to 1 MB and 200 contacts.");
      const buffer = await file.arrayBuffer();
      if (!job.current()) return;
      const decoded = decodeVCardBytes(buffer);
      const contacts = parseVCard(decoded.text).contacts;
      if (contacts.length > 200)
        throw new Error(
          "Generate up to 200 QR codes at a time. Split the file first.",
        );
      setBatch(contacts);
      setRaw(decoded.text);
      setFileName(file.name);
      setStatus(`${contacts.length} contacts ready`);
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
  function downloadSingle() {
    if (!svg) return;
    download(svg, "contact-qr.svg", "image/svg+xml;charset=utf-8");
    download(contactText, "contact.vcf", "text/vcard;charset=utf-8");
    trackEvent("download_clicked", {
      tool_slug: "vcard-qr-code",
      output_format: "svg",
    });
  }
  async function downloadBatch() {
    if (!batch.length || operation.busy) return;
    const job = operation.begin();
    const files: Record<string, Uint8Array> = {};
    const skipped: string[] = [];
    try {
      for (const [index, contact] of batch.entries()) {
        if (!job.current()) return;
        setStatus(`Generating QR ${index + 1} of ${batch.length}…`);
        const label = contact.formattedName || `Contact ${index + 1}`;
        try {
          const code = qrToSvg(serializeVCards([contact]));
          const name =
            label
              .replace(/[^a-z0-9]+/gi, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 64)
              .toLowerCase() || `contact-${index + 1}`;
          files[`${String(index + 1).padStart(4, "0")}-${name}.svg`] =
            new TextEncoder().encode(code);
        } catch {
          skipped.push(`${index + 1}. ${label}`);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      }
      if (!job.current()) return;
      const count = Object.keys(files).length;
      if (skipped.length)
        files["skipped-contacts.txt"] = new TextEncoder().encode(
          `These contacts exceeded the QR capacity and were not included:\n${skipped.join("\n")}`,
        );
      if (!count)
        throw new Error(
          "No contacts fit the QR size limit. Shorten optional details first.",
        );
      download(
        zipSync(files) as unknown as ArrayBuffer,
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-qr.zip`,
        "application/zip",
      );
      setStatus(
        `Downloaded ${count} QR codes${skipped.length ? ` · ${skipped.length} skipped; their names are listed in the ZIP` : ""}`,
      );
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Could not generate the ZIP.",
        );
        job.fail();
      }
    }
  }

  return (
    <div className="creator-card">
      <input
        ref={inputRef}
        type="file"
        accept=".vcf,.vcard,text/vcard"
        onChange={handleFile}
        hidden
        aria-label="Choose VCF for QR batch"
      />
      <div className="creator-toolbar">
        <span className="file-icon">QR</span>
        <div>
          <strong>
            {mode === "single" ? "vCard QR code" : "VCF to QR codes"}
          </strong>
          <small aria-live="polite">
            {qr.error || status} · generated locally
          </small>
        </div>
        <button className="text-button" onClick={loadSample}>
          Try a sample
        </button>
        {operation.busy && (
          <button
            className="secondary-button"
            onClick={() => {
              operation.cancel();
              setStatus("Cancelled. No new output was downloaded.");
            }}
          >
            Cancel
          </button>
        )}
        {mode === "single" ? (
          <button
            className="primary-button compact"
            onClick={downloadSingle}
            disabled={!svg}
          >
            Download QR <span>↓</span>
          </button>
        ) : (
          <button
            className="primary-button compact"
            onClick={downloadBatch}
            disabled={!parsed.contacts.length || operation.busy}
          >
            Download ZIP <span>↓</span>
          </button>
        )}
      </div>
      {mode === "single" ? (
        <div className="creator-grid">
          <section className="creator-form">
            <p className="eyebrow">CONTACT DETAILS</p>
            <div className="form-grid">
              <label>
                First name
                <input
                  maxLength={512}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label>
                Last name
                <input
                  maxLength={512}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="wide">
                Phone
                <input
                  maxLength={512}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label className="wide">
                Email
                <input
                  maxLength={512}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="wide">
                Organization
                <input
                  maxLength={512}
                  value={organisation}
                  onChange={(event) => setOrganization(event.target.value)}
                />
              </label>
              <label>
                Error correction
                <select
                  value={errorCorrection}
                  onChange={(event) =>
                    setErrorCorrection(event.target.value as QrErrorCorrection)
                  }
                  aria-label="QR error correction level"
                >
                  <option value="L">Low — holds the most data</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High — best for logo overlays</option>
                </select>
              </label>
            </div>
            <p className="mapping-note">
              The QR contains an ordinary vCard payload. No contact data is
              uploaded.
            </p>
          </section>
          <section className="creator-preview">
            <p className="eyebrow">QR PREVIEW</p>
            {svg ? (
              <div
                className="qr-preview"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <p className="empty-preview">
                {qr.error ||
                  "Add a name, phone, or email to preview a QR code."}
              </p>
            )}
            <pre>{contactText}</pre>
          </section>
        </div>
      ) : (
        <>
          {!raw ? (
            <div className="conversion-dropzone">
              <div className="drop-icon" aria-hidden="true">
                ↥
              </div>
              <h2>Choose a VCF file</h2>
              <p>
                Generate one QR SVG per contact and download them as a ZIP. Up
                to 200 contacts and 1 MB per batch.
              </p>
              <div className="drop-actions">
                <button
                  className="primary-button"
                  onClick={() => inputRef.current?.click()}
                >
                  Choose VCF
                </button>
                <button className="text-button" onClick={loadSample}>
                  Try a sample
                </button>
              </div>
              <small>Local processing · no contact data upload</small>
            </div>
          ) : (
            <section className="preview-section">
              <div className="preview-heading">
                <div>
                  <p className="eyebrow">QR BATCH PREVIEW</p>
                  <h2>{parsed?.contacts.length.toLocaleString()} contacts</h2>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    operation.cancel();
                    setBatch([]);
                    setRaw("");
                    setFileName("");
                  }}
                >
                  Open another
                </button>
              </div>
              <p className="mapping-note">
                Each contact becomes a standalone SVG in a ZIP. Very long cards
                may exceed the compact QR capacity and are skipped with a local
                status message.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
