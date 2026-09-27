"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { guardFile } from "../lib/file-guard";
import {
  decodeVCardBytes,
  parseVCard,
  serializeVCard,
  type Contact,
  type ParseResult,
} from "../lib/vcard";
import { downloadFile } from "../lib/download";
import { useLocalOperation } from "../lib/use-local-operation";

const sample =
  "BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL:ada@example.test\nEND:VCARD";
export default function VCardViewer({ table = false }: { table?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const operation = useLocalOperation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("Choose a VCF file to inspect");
  const selected =
    contacts.find((contact) => contact.id === selectedId) ?? null;
  const filtered = useMemo(
    () =>
      contacts.filter((contact) =>
        `${contact.formattedName} ${contact.phones.join(" ")} ${contact.emails.join(" ")} ${contact.organisation}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [contacts, query],
  );
  const shown = filtered.slice(page * 100, (page + 1) * 100);
  function open(
    text: string,
    name: string,
    encoding: ParseResult["encoding"] = "UTF-8",
  ) {
    const parsed = { ...parseVCard(text), encoding };
    setContacts(parsed.contacts);
    setResult(parsed);
    setSelectedId(parsed.contacts[0]?.id ?? null);
    setQuery("");
    setPage(0);
    setFileName(name);
    setStatus(
      `${parsed.contacts.length.toLocaleString()} contacts · ${encoding} · read-only`,
    );
  }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const job = operation.begin();
    setContacts([]);
    setResult(null);
    setStatus("Reading…");
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
      open(decoded.text, file.name, decoded.encoding);
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
  return (
    <div className="viewer-card">
      <input
        ref={inputRef}
        aria-label="Choose VCF"
        type="file"
        accept=".vcf,.vcard"
        onChange={handleFile}
        hidden
      />
      <div className="conversion-toolbar">
        <div>
          <strong>
            {fileName || (table ? "Contact table" : "VCF viewer")}
          </strong>
          <small aria-live="polite">{status}</small>
        </div>
        <button
          className="secondary-button"
          onClick={() => inputRef.current?.click()}
        >
          {contacts.length ? "Open another" : "Choose VCF"}
        </button>
        {!contacts.length && (
          <button
            className="text-button"
            onClick={() => {
              operation.cancel();
              open(sample, "sample.vcf");
            }}
          >
            Try a sample
          </button>
        )}
        {selected && (
          <button
            className="primary-button compact"
            onClick={() =>
              downloadFile(
                `${serializeVCard(selected)}\r\n`,
                "selected-contact.vcf",
                "text/vcard;charset=utf-8",
              )
            }
          >
            Download selected contact
          </button>
        )}
      </div>
      {contacts.length > 0 && (
        <>
          <label className="search-box">
            Search
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
            />
          </label>
          <div className="list-meta">
            <span>
              {filtered.length} results · {result?.issues.length ?? 0} source
              warnings
            </span>
            <span>
              Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / 100))}
            </span>
            <button
              className="text-button"
              disabled={!page}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="text-button"
              disabled={(page + 1) * 100 >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
          {table ? (
            <div className="preview-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phones</th>
                    <th>Emails</th>
                    <th>Organization</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <button
                          className="text-button"
                          aria-pressed={contact.id === selectedId}
                          onClick={() => setSelectedId(contact.id)}
                        >
                          {contact.formattedName || "Unnamed contact"}
                        </button>
                      </td>
                      <td>{contact.phones.join(" · ")}</td>
                      <td>{contact.emails.join(" · ")}</td>
                      <td>{contact.organisation}</td>
                      <td>{contact.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="viewer-body">
              <aside className="contact-list">
                <div className="contacts-scroll">
                  {shown.map((contact) => (
                    <button
                      className={`contact-row ${selectedId === contact.id ? "active" : ""}`}
                      key={contact.id}
                      onClick={() => setSelectedId(contact.id)}
                    >
                      <span>
                        <strong>
                          {contact.formattedName || "Unnamed contact"}
                        </strong>
                        <small>
                          {contact.emails[0] ||
                            contact.phones[0] ||
                            "No details"}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>
              <section className="viewer-detail">
                {selected && (
                  <>
                    <h2>{selected.formattedName || "Unnamed contact"}</h2>
                    <p>{selected.phones.join(" · ")}</p>
                    <p>{selected.emails.join(" · ")}</p>
                    <p>{selected.organisation}</p>
                    <p>{selected.note}</p>
                    <details className="raw-details">
                      <summary>All source properties</summary>
                      <pre>{serializeVCard(selected)}</pre>
                    </details>
                  </>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
