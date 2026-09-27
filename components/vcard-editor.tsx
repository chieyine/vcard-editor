"use client";

import { downloadFile as downloadBlob } from "../lib/download";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { readEditorSession, saveEditorSession } from "../lib/editor-session";
import { guardFiles } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";
import {
  Contact,
  createChangeReport,
  decodeVCardBytes,
  KnownVCardVersion,
  parseVCard,
  ParseResult,
  SerializeOptions,
  serializeVCard,
  serializeVCards,
  conversionWarnings,
  splitStructuredValue,
  joinStructuredValue,
} from "../lib/vcard";

import { isEmptyContact, validateContacts } from "../lib/contact-tools";

const sample = `BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL;TYPE=INTERNET:ada@example.com\nORG:Northstar Studio\nTITLE:Product designer\nCATEGORIES:clients,design\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nTEL;TYPE=WORK:+233 20 555 0101\nEMAIL:kojo@example.com\nNOTE:Call after 10am\nEND:VCARD`;

type WorkerResult =
  | { type: "RESULT"; jobId: string; payload: ParseResult }
  | { type: "PROGRESS"; jobId: string; percent: number }
  | { type: "ERROR"; jobId: string; message: string };

function AddressFields({
  contact,
  update,
}: {
  contact: Contact;
  update: (patch: Partial<Contact>) => void;
}) {
  const raw = contact.address ?? "";
  const parts = raw.includes(";") ? splitStructuredValue(raw) : ["", "", raw];
  const compose = (index: number, value: string) => {
    const nextParts = [...parts];
    while (nextParts.length <= index) nextParts.push("");
    nextParts[index] = value;
    update({ address: joinStructuredValue(nextParts) });
  };
  return (
    <fieldset className="address-fields wide">
      <legend>Address</legend>
      <div className="form-grid">
        <label>
          Street
          <input
            maxLength={65536}
            value={parts[2] ?? ""}
            onChange={(event) => compose(2, event.target.value)}
          />
        </label>
        <label>
          City
          <input
            maxLength={65536}
            value={parts[3] ?? ""}
            onChange={(event) => compose(3, event.target.value)}
          />
        </label>
        <label>
          Region / state
          <input
            maxLength={65536}
            value={parts[4] ?? ""}
            onChange={(event) => compose(4, event.target.value)}
          />
        </label>
        <label>
          Postal code
          <input
            maxLength={65536}
            value={parts[5] ?? ""}
            onChange={(event) => compose(5, event.target.value)}
          />
        </label>
        <label>
          Country
          <input
            maxLength={65536}
            value={parts[6] ?? ""}
            onChange={(event) => compose(6, event.target.value)}
          />
        </label>
      </div>
    </fieldset>
  );
}

function AdvancedContactFields({
  contact,
  update,
}: {
  contact: Contact;
  update: (patch: Partial<Contact>) => void;
}) {
  return (
    <section aria-label="Additional contact fields">
      <p className="eyebrow">ADDITIONAL FIELDS</p>
      <div className="form-grid">
        <label>
          Nickname
          <input
            maxLength={65536}
            value={contact.nickname ?? ""}
            onChange={(event) => update({ nickname: event.target.value })}
          />
        </label>
        <label>
          Department
          <input
            maxLength={65536}
            value={contact.department ?? ""}
            onChange={(event) => update({ department: event.target.value })}
          />
        </label>
        <label>
          Role
          <input
            maxLength={65536}
            value={contact.role ?? ""}
            onChange={(event) => update({ role: event.target.value })}
          />
        </label>
        <label>
          Birthday
          <input
            type="date"
            value={contact.birthday ?? ""}
            onChange={(event) => update({ birthday: event.target.value })}
          />
        </label>
        <label className="wide">
          Website
          <input
            maxLength={65536}
            value={contact.url ?? ""}
            onChange={(event) => update({ url: event.target.value })}
            placeholder="https://…"
          />
        </label>
        <AddressFields contact={contact} update={update} />
      </div>
    </section>
  );
}

function RepeatableFields({
  label,
  values,
  types,
  onChange,
}: {
  label: "Phone" | "Email";
  values: string[];
  types: string[];
  onChange: (values: string[], types: string[]) => void;
}) {
  const defaults = label === "Phone" ? "CELL" : "INTERNET";
  const rows = values.length ? values : [""];
  return (
    <fieldset className="repeatable-fields wide">
      <legend>{label}s</legend>
      {rows.map((value, index) => (
        <div className="repeatable-row" key={`${label}-${index}`}>
          <label>
            <span>
              {label} {index + 1}
            </span>
            <input
              type={label === "Email" ? "email" : "tel"}
              value={value}
              onChange={(event) => {
                const next = [...rows];
                next[index] = event.target.value;
                onChange(next, types);
              }}
            />
          </label>
          <label>
            <span>Type</span>
            <select
              value={types[index] ?? ""}
              onChange={(event) => {
                const next = rows.map(
                  (_, itemIndex) => types[itemIndex] ?? defaults,
                );
                next[index] = event.target.value;
                onChange(rows, next);
              }}
            >
              <option value="">No label</option>
              {types[index] &&
                ![defaults, "HOME", "WORK", "VOICE", "FAX"].includes(
                  types[index],
                ) && <option value={types[index]}>{types[index]}</option>}
              <option value={defaults}>{defaults}</option>
              <option value="HOME">HOME</option>
              <option value="WORK">WORK</option>
              {label === "Phone" && (
                <>
                  <option value="VOICE">VOICE</option>
                  <option value="FAX">FAX</option>
                </>
              )}
            </select>
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            disabled={rows.length === 1 && !value}
            onClick={() =>
              onChange(
                rows.filter((_, itemIndex) => itemIndex !== index),
                types.filter((_, itemIndex) => itemIndex !== index),
              )
            }
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-button"
        onClick={() =>
          onChange(
            [...rows, ""],
            [...rows.map((_, index) => types[index] ?? defaults), defaults],
          )
        }
      >
        + Add {label.toLowerCase()}
      </button>
    </fieldset>
  );
}

function blankContact(index: number): Contact {
  return {
    id: `new-${Date.now()}-${index}`,
    version: "3.0",
    firstName: "",
    lastName: "",
    formattedName: "",
    phones: [],
    emails: [],
    organisation: "",
    title: "",
    note: "",
    uid: "",
    categories: [],
    photo: "",
    rawProperties: [],
    properties: [],
    issues: [],
  };
}

export default function VCardEditor() {
  const [initial] = useState(readEditorSession);
  const editTransaction = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const parseTimerRef = useRef<number | null>(null);
  const importIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [savedContacts, setSavedContacts] = useState<Contact[] | null>(
    initial?.savedContacts ?? null,
  );
  const [contacts, setContacts] = useState<Contact[]>(initial?.contacts ?? []);
  const [past, setPast] = useState<Contact[][]>(initial?.past ?? []);
  const [future, setFuture] = useState<Contact[][]>(initial?.future ?? []);
  const [parseResult, setParseResult] = useState<ParseResult | null>(
    initial?.parseResult ?? null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initial?.selectedId ?? null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    initial?.selectedIds ?? new Set(),
  );
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState(initial?.fileName ?? "");
  const [status, setStatus] = useState(
    initial?.contacts.length
      ? "Restored this tab’s editor session"
      : "Choose a VCF file to begin",
  );
  const [statusDetail, setStatusDetail] = useState("");
  const [showWarnings, setShowWarnings] = useState(false);
  const [showRaw, setShowRaw] = useState(initial?.showRaw ?? false);
  const [rawDraft, setRawDraft] = useState(initial?.rawDraft ?? "");
  const [rawBaseline, setRawBaseline] = useState(initial?.rawBaseline ?? "");
  const [showExport, setShowExport] = useState(false);
  const [exportVersion, setExportVersion] = useState<
    KnownVCardVersion | "original"
  >("original");
  const [preserveUnknown, setPreserveUnknown] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [lineEnding, setLineEnding] = useState<"CRLF" | "LF">("CRLF");
  const [exportScope, setExportScope] = useState<"all" | "selected">("all");
  const [sortKey, setSortKey] = useState<"file" | "name" | "organisation">(
    "file",
  );
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    saveEditorSession({
      contacts,
      savedContacts,
      past,
      future,
      parseResult,
      selectedId,
      selectedIds,
      fileName,
      rawDraft,
      rawBaseline,
      showRaw,
    });
  }, [
    contacts,
    savedContacts,
    past,
    future,
    parseResult,
    selectedId,
    selectedIds,
    fileName,
    rawDraft,
    rawBaseline,
    showRaw,
  ]);
  const currentVersions = useMemo(
    () =>
      contacts.reduce<Record<string, number>>((counts, contact) => {
        counts[contact.version] = (counts[contact.version] ?? 0) + 1;
        return counts;
      }, {}),
    [contacts],
  );
  const selected =
    contacts.find((contact) => contact.id === selectedId) ?? null;
  const filtered = useMemo(() => {
    const matches = contacts.filter((contact) =>
      `${contact.formattedName} ${contact.firstName} ${contact.lastName} ${contact.organisation} ${contact.title} ${contact.uid} ${contact.note} ${contact.emails.join(" ")} ${contact.phones.join(" ")} ${contact.categories.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    if (sortKey === "file") return matches;
    const value = (contact: Contact) =>
      sortKey === "organisation"
        ? contact.organisation
        : contact.formattedName || `${contact.firstName} ${contact.lastName}`;
    return [...matches].sort((left, right) =>
      value(left).localeCompare(value(right), undefined, {
        sensitivity: "base",
        numeric: true,
      }),
    );
  }, [contacts, query, sortKey]);
  const virtualStart = Math.min(
    Math.max(0, filtered.length - 1),
    Math.max(0, Math.floor(scrollTop / 62) - 4),
  );
  const virtualEnd = Math.min(filtered.length, virtualStart + 18);
  const visibleContacts = filtered.slice(virtualStart, virtualEnd);
  const selectedIssues = useMemo(() => {
    if (!selected) return [];
    try {
      const parsed = parseVCard(serializeVCard(selected));
      return validateContacts(parsed.contacts, parsed);
    } catch (error) {
      return [
        {
          code: "EDIT_LIMIT",
          severity: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : "This contact cannot be processed.",
        },
      ];
    }
  }, [selected]);
  const issueCount = selectedIssues.length;
  const draftDirty = showRaw && rawDraft !== rawBaseline;
  const hasChanges =
    (savedContacts !== null && contacts !== savedContacts) || draftDirty;
  function discardDraft() {
    if (
      draftDirty &&
      !window.confirm("Discard the raw changes that have not been applied?")
    )
      return false;
    setShowRaw(false);
    return true;
  }

  function applyParsed(
    parsed: ParseResult,
    name: string,
    source: "worker" | "browser",
  ) {
    editTransaction.current = null;
    setExportVersion("original");
    setContacts(parsed.contacts);
    setSavedContacts(parsed.contacts);
    setIsParsing(false);
    setQuery("");
    setSortKey("file");
    setScrollTop(0);
    if (listRef.current) listRef.current.scrollTop = 0;
    setShowExport(false);
    setExportScope("all");
    setPast([]);
    setFuture([]);
    setParseResult(parsed);
    setSelectedId(parsed.contacts[0]?.id ?? null);
    setSelectedIds(new Set());
    setRawDraft("");
    setRawBaseline("");
    setFileName(name);
    setStatus(
      parsed.contacts.length
        ? `${parsed.contacts.length.toLocaleString()} contacts ready`
        : "No contacts found",
    );
    setStatusDetail(
      `${source === "worker" ? "Worker" : "Browser"} parsed · ${parsed.encoding} · ${parsed.lineEnding}`,
    );
    setShowWarnings(parsed.issues.length > 0);
    setShowRaw(false);
    trackEvent("parse_succeeded", {
      tool_slug: "vcf-editor",
      source,
      contact_count_bucket:
        parsed.contacts.length > 1000
          ? "1000-plus"
          : parsed.contacts.length > 100
            ? "101-1000"
            : "0-100",
    });
  }

  const stopProcessing = useCallback(() => {
    importIdRef.current += 1;
    if (parseTimerRef.current !== null)
      window.clearTimeout(parseTimerRef.current);
    parseTimerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  function parseWithWorker(
    buffer: ArrayBuffer,
    name: string,
    importId: number,
  ) {
    const fallbackBuffer = buffer.slice(0);
    setStatus("Opening contacts…");
    trackEvent("parse_started", {
      tool_slug: "vcf-editor",
      input_format: "vcf",
    });
    const finish = (parsed: ParseResult, source: "worker" | "browser") => {
      if (importId !== importIdRef.current) return;
      stopProcessing();
      applyParsed(parsed, name, source);
    };
    const fallback = () => {
      if (importId !== importIdRef.current) return;
      workerRef.current?.terminate();
      if (fallbackBuffer.byteLength > 512 * 1024) {
        stopProcessing();
        setIsParsing(false);
        setStatus(
          "The worker could not finish. Try a smaller file or reopen this page.",
        );
        return;
      }
      try {
        const decoded = decodeVCardBytes(fallbackBuffer);
        finish(
          { ...parseVCard(decoded.text), encoding: decoded.encoding },
          "browser",
        );
      } catch {
        stopProcessing();
        setIsParsing(false);
        setStatus("That file could not be processed. Try a smaller file.");
      }
    };
    try {
      const worker = new Worker(
        new URL("../lib/vcard-worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;
      const jobId = String(importId);
      parseTimerRef.current = window.setTimeout(() => {
        if (importId !== importIdRef.current) return;
        stopProcessing();
        setIsParsing(false);
        setStatus("Opening timed out. Split the file and try again.");
      }, 15000);
      worker.onmessage = (event: MessageEvent<WorkerResult>) => {
        if (importId !== importIdRef.current || event.data.jobId !== jobId)
          return;
        if (event.data.type === "PROGRESS") {
          setStatusDetail(
            event.data.percent < 45
              ? "Decoding file…"
              : event.data.percent < 90
                ? "Reading contact properties…"
                : "Preparing editor…",
          );
          return;
        }
        if (event.data.type === "RESULT") finish(event.data.payload, "worker");
        else fallback();
      };
      worker.onerror = fallback;
      worker.postMessage({ type: "PARSE", jobId, buffer }, [buffer]);
    } catch {
      fallback();
    }
  }

  function cancelParsing() {
    stopProcessing();
    setIsParsing(false);
    setStatus("Opening cancelled");
    setStatusDetail("");
  }

  function openText(text: string, name: string) {
    stopProcessing();
    applyParsed({ ...parseVCard(text), encoding: "UTF-8" }, name, "browser");
  }

  async function readFiles(files: File[]) {
    if (!files.length) return;
    const guard = guardFiles(files, [".vcf", ".vcard"]);
    if (!guard.ok) {
      setStatus(guard.message);
      return;
    }
    if (
      hasChanges &&
      !window.confirm("Discard changes that have not been downloaded?")
    )
      return;
    stopProcessing();
    const importId = importIdRef.current;
    setIsParsing(true);
    setStatus("Reading contact files…");
    setStatusDetail(guard.warning ?? "");
    trackEvent("file_selected", {
      tool_slug: "vcf-editor",
      input_format: "vcf",
      size_bucket: guard.warning ? "large" : "standard",
    });
    try {
      const buffers = await Promise.all(
        files.map((file) => file.arrayBuffer()),
      );
      if (importId !== importIdRef.current) return;
      const buffer =
        files.length === 1
          ? buffers[0]
          : new TextEncoder().encode(
              buffers.map((item) => decodeVCardBytes(item).text).join("\r\n"),
            ).buffer;
      parseWithWorker(
        buffer,
        files.length === 1 ? files[0].name : `${files.length}-files.vcf`,
        importId,
      );
    } catch {
      if (importId !== importIdRef.current) return;
      stopProcessing();
      setIsParsing(false);
      setStatus(
        "One of those files could not be read. Please choose it again.",
      );
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    void readFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function commitContacts(
    next: Contact[],
    message?: string,
    transaction?: string,
  ) {
    if (!transaction || editTransaction.current !== transaction)
      setPast((entries) => [...entries.slice(-29), contacts]);
    editTransaction.current = transaction ?? null;
    setContacts(next);
    setFuture([]);
    if (message) setStatus(message);
  }

  function updateSelected(patch: Partial<Contact>) {
    if (!selected) return;
    const next = { ...patch };
    if (
      ("firstName" in patch || "lastName" in patch) &&
      selected.formattedName ===
        [selected.firstName, selected.lastName].filter(Boolean).join(" ")
    )
      next.formattedName = [
        patch.firstName ?? selected.firstName,
        patch.lastName ?? selected.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    commitContacts(
      contacts.map((item) =>
        item.id === selected.id ? { ...item, ...next } : item,
      ),
      undefined,
      `${selected.id}:${Object.keys(patch).sort().join(",")}`,
    );
  }

  function undo() {
    if (!discardDraft()) return;
    editTransaction.current = null;
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((entries) => [contacts, ...entries]);
    setContacts(previous);
    setSelectedId((current) =>
      previous.some((contact) => contact.id === current)
        ? current
        : (previous[0]?.id ?? null),
    );
    setSelectedIds(
      (current) =>
        new Set(
          [...current].filter((id) =>
            previous.some((contact) => contact.id === id),
          ),
        ),
    );
    setPast((entries) => entries.slice(0, -1));
    setStatus("Undid the last change");
  }

  function redo() {
    if (!discardDraft()) return;
    editTransaction.current = null;
    const next = future[0];
    if (!next) return;
    setPast((entries) => [...entries, contacts]);
    setContacts(next);
    setSelectedId((current) =>
      next.some((contact) => contact.id === current)
        ? current
        : (next[0]?.id ?? null),
    );
    setSelectedIds(
      (current) =>
        new Set(
          [...current].filter((id) =>
            next.some((contact) => contact.id === id),
          ),
        ),
    );
    setFuture((entries) => entries.slice(1));
    setStatus("Redid the last change");
  }

  function cleanWhitespace() {
    if (!discardDraft()) return;
    const cleaned = contacts.map((contact) => ({
      ...contact,
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      formattedName: contact.formattedName.trim(),
      organisation: contact.organisation.trim(),
      title: contact.title.trim(),
      note: contact.note.trim(),
      phones: contact.phones.map((value) => value.trim()),
      emails: contact.emails.map((value) => value.trim()),
    }));
    commitContacts(
      cleaned,
      `Cleaned whitespace in ${cleaned.length.toLocaleString()} contacts`,
    );
  }

  function bulkFindReplace() {
    if (!discardDraft()) return;
    if (!findText) {
      setStatus("Enter the text to find first");
      return;
    }
    let affected = 0;
    const swap = (value: string) => value.split(findText).join(replaceText);
    const next = contacts.map((contact) => {
      const updated: Contact = {
        ...contact,
        firstName: swap(contact.firstName),
        lastName: swap(contact.lastName),
        formattedName: swap(contact.formattedName),
        organisation: swap(contact.organisation),
        title: swap(contact.title),
        note: swap(contact.note),
        nickname: contact.nickname ? swap(contact.nickname) : contact.nickname,
        department: contact.department
          ? swap(contact.department)
          : contact.department,
        role: contact.role ? swap(contact.role) : contact.role,
        url: contact.url ? swap(contact.url) : contact.url,
        address: contact.address ? swap(contact.address) : contact.address,
        phones: contact.phones.map(swap),
        emails: contact.emails.map(swap),
        categories: contact.categories.map(swap),
      };
      if (JSON.stringify(updated) !== JSON.stringify(contact)) affected += 1;
      return updated;
    });
    if (!affected) {
      setStatus(`No contacts contain “${findText}”`);
      return;
    }
    commitContacts(
      next,
      `Replaced ${affected.toLocaleString()} contact${affected === 1 ? "" : "s"} containing “${findText}”`,
    );
  }

  function bulkRemove(field: "photo" | "note" | "address") {
    if (!discardDraft()) return;
    const affected = contacts.filter((contact) =>
      field === "photo"
        ? contact.photo
        : field === "note"
          ? contact.note
          : contact.address,
    ).length;
    if (!affected) {
      setStatus(`No ${field} values found`);
      return;
    }
    if (
      !window.confirm(
        `Remove ${field} values from ${affected} contact${affected === 1 ? "" : "s"}? You can undo this action.`,
      )
    )
      return;
    commitContacts(
      contacts.map((contact) =>
        field === "photo"
          ? {
              ...contact,
              photo: "",
              forceProperties: [...(contact.forceProperties ?? []), "PHOTO"],
            }
          : field === "note"
            ? {
                ...contact,
                note: "",
                forceProperties: [...(contact.forceProperties ?? []), "NOTE"],
              }
            : {
                ...contact,
                address: "",
                forceProperties: [...(contact.forceProperties ?? []), "ADR"],
              },
      ),
      `Removed ${field} values from ${affected} contacts`,
    );
  }

  function removeEmpty() {
    if (!discardDraft()) return;
    const kept = contacts.filter((contact) => !isEmptyContact(contact));
    const removed = contacts.length - kept.length;
    if (!removed) {
      setStatus("No empty contacts found");
      return;
    }
    commitContacts(
      kept,
      `Removed ${removed.toLocaleString()} empty contact${removed === 1 ? "" : "s"}`,
    );
    if (!kept.some((contact) => contact.id === selectedId))
      setSelectedId(kept[0]?.id ?? null);
  }

  function selectContact(id: string) {
    if (!discardDraft()) return false;
    editTransaction.current = null;
    setSelectedId(id);
    const next = contacts.find((contact) => contact.id === id);
    setRawDraft(next ? serializeVCard(next) : "");
    setShowRaw(false);
    return true;
  }

  function handleListKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (
      !(event.target instanceof HTMLButtonElement) ||
      !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    const button = event.target;
    const index = filtered.findIndex(
      (contact) => contact.id === button.getAttribute("data-contact-id"),
    );
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? filtered.length - 1
          : Math.max(
              0,
              Math.min(
                filtered.length - 1,
                index + (event.key === "ArrowDown" ? 1 : -1),
              ),
            );
    const next = filtered[nextIndex];
    if (!next || !selectContact(next.id)) return;
    const top = Math.max(0, nextIndex * 62 - 124);
    if (listRef.current) listRef.current.scrollTop = top;
    setScrollTop(top);
    window.requestAnimationFrame(() =>
      listRef.current
        ?.querySelector<HTMLButtonElement>(
          `[data-contact-id="${CSS.escape(next.id)}"]`,
        )
        ?.focus({ preventScroll: true }),
    );
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addContact() {
    if (!discardDraft()) return;
    const contact = blankContact(contacts.length);
    commitContacts([...contacts, contact], "Added a blank contact");
    setSelectedId(contact.id);
    setRawDraft("");
  }

  function deleteCurrent() {
    if (!discardDraft()) return;
    if (
      !selected ||
      !window.confirm(
        `Remove ${selected.formattedName || "this contact"}? You can undo this action.`,
      )
    )
      return;
    const next = contacts.filter((contact) => contact.id !== selected.id);
    commitContacts(next, "Removed one contact");
    setSelectedId(next[0]?.id ?? null);
    setSelectedIds((current) => {
      const value = new Set(current);
      value.delete(selected.id);
      return value;
    });
  }

  function applyRaw() {
    if (!selected) return;
    let parsed: ParseResult;
    try {
      parsed = parseVCard(rawDraft);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid raw vCard");
      return;
    }
    if (parsed.contacts.length !== 1) {
      setStatus("Raw view must contain exactly one vCard");
      return;
    }
    commitContacts(
      contacts.map((contact) =>
        contact.id === selected.id
          ? { ...parsed.contacts[0], id: selected.id }
          : contact,
      ),
      "Applied raw vCard changes",
    );
    setShowRaw(false);
  }

  function exportOptions(): SerializeOptions {
    return {
      version: exportVersion === "original" ? undefined : exportVersion,
      lineEnding,
      preserveUnknown,
      includePhotos,
    };
  }

  function download() {
    if (!contacts.length || !parseResult) return;
    if (draftDirty) {
      setStatus("Apply or discard the raw draft before downloading.");
      return;
    }
    const options = exportOptions();
    const exportContacts =
      exportScope === "selected"
        ? contacts.filter((contact) => selectedIds.has(contact.id))
        : contacts;
    if (!exportContacts.length) {
      setStatus("Select at least one contact to export");
      return;
    }
    downloadBlob(
      serializeVCards(exportContacts, options),
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-edited.vcf`,
      "text/vcard;charset=utf-8",
    );
    trackEvent("download_clicked", {
      tool_slug: "vcf-editor",
      output_format: "vcf",
      contact_count_bucket:
        contacts.length > 1000
          ? "1000-plus"
          : contacts.length > 100
            ? "101-1000"
            : "0-100",
    });
    setStatus("Downloaded an updated vCard");
    setStatusDetail(
      `${exportContacts.length.toLocaleString()} contacts · ${exportVersion} · ${lineEnding}`,
    );
    if (exportScope === "all") setSavedContacts(contacts);
    setShowExport(false);
  }

  function downloadReport() {
    if (!parseResult) return;
    downloadBlob(
      createChangeReport(
        parseResult.contacts.length,
        contacts,
        {
          ...parseResult,
          issues: validateContacts(
            contacts,
            parseVCard(serializeVCards(contacts)),
          ),
        },
        exportOptions(),
      ),
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-change-report.txt`,
      "text/plain;charset=utf-8",
    );
  }

  function reset() {
    if (
      hasChanges &&
      !window.confirm("Discard changes that have not been downloaded?")
    )
      return;
    stopProcessing();
    setIsParsing(false);
    setSavedContacts(null);
    setQuery("");
    setScrollTop(0);
    setContacts([]);
    setPast([]);
    setFuture([]);
    setParseResult(null);
    setSelectedId(null);
    setSelectedIds(new Set());
    setFileName("");
    setStatus("Choose a VCF file to begin");
    setStatusDetail("");
    setShowWarnings(false);
    setShowRaw(false);
    setShowExport(false);
  }

  function loadSample() {
    if (
      hasChanges &&
      !window.confirm("Discard your current changes and load the sample?")
    )
      return;
    trackEvent("sample_loaded", { tool_slug: "vcf-editor", source: "sample" });
    openText(sample, "sample-contacts.vcf");
  }

  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    // Client navigation retains the draft in tab memory; full unloads still warn.
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => stopProcessing, [stopProcessing]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      const key = event.key.toLowerCase();
      if (key === "o" && !typing) {
        event.preventDefault();
        inputRef.current?.click();
      } else if (
        key === "z" &&
        !typing &&
        (event.shiftKey ? future.length : past.length)
      ) {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });

  return (
    <div
      className="editor-card"
      onBlurCapture={() => {
        editTransaction.current = null;
      }}
    >
      <input
        ref={inputRef}
        aria-label="Choose VCF files"
        type="file"
        multiple
        accept=".vcf,.vcard,text/vcard"
        onChange={handleFile}
        hidden
      />
      <div className="editor-topbar">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="editor-title">Local workspace</span>
        <span className="editor-state" aria-live="polite">
          <span aria-hidden="true">●</span> {status}
          {statusDetail && <small>{statusDetail}</small>}
        </span>
      </div>
      {!parseResult ? (
        <div
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void readFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <div className="drop-icon" aria-hidden="true">
            ↥
          </div>
          <h2>Open contact files</h2>
          <p>
            Drop one or several <strong>.vcf</strong> or <strong>.vcard</strong>{" "}
            files here, or choose them from your device.
          </p>
          <div className="drop-actions">
            <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
            >
              Choose VCF files
            </button>
            <button className="text-button" onClick={loadSample}>
              Try a sample file
            </button>
            <button
              className="text-button"
              onClick={() => {
                stopProcessing();
                applyParsed(
                  {
                    contacts: [blankContact(0)],
                    warnings: [],
                    issues: [],
                    versions: { "3.0": 1 },
                    lineEnding: "CRLF",
                    encoding: "UTF-8",
                    totalLines: 0,
                  },
                  "new-contact.vcf",
                  "browser",
                );
              }}
            >
              Create blank contact
            </button>
          </div>
          <small>Processed locally in your browser · nothing is uploaded</small>
          {isParsing ? (
            <button className="text-button" onClick={cancelParsing}>
              Cancel processing
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="editor-toolbar">
            <div className="file-summary">
              <span className="file-icon">VCF</span>
              <span>
                <strong>{fileName}</strong>
                <small>
                  {contacts.length.toLocaleString()} contacts ·{" "}
                  {Object.entries(currentVersions)
                    .map(([version, count]) => `${count} v${version}`)
                    .join(" · ")}
                  {hasChanges ? " · unsaved changes" : ""}
                </small>
              </span>
            </div>
            <div className="toolbar-actions">
              {isParsing && (
                <button className="text-button" onClick={cancelParsing}>
                  Cancel opening
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Undo"
                title="Undo"
                disabled={!past.length}
                onClick={undo}
              >
                ↶
              </button>
              <button
                className="icon-button"
                aria-label="Redo"
                title="Redo"
                disabled={!future.length}
                onClick={redo}
              >
                ↷
              </button>
              <button className="secondary-button" onClick={reset}>
                Open another
              </button>
              <button
                className="primary-button compact"
                onClick={() => {
                  trackEvent("export_options_opened", {
                    tool_slug: "vcf-editor",
                  });
                  setShowExport((value) => !value);
                }}
              >
                Export <span>↓</span>
              </button>
            </div>
          </div>
          {showExport && (
            <div className="export-panel">
              <div>
                <strong>Export review</strong>
                <small>
                  {issueCount} warning{issueCount === 1 ? "" : "s"} in the
                  selected contact · original file remains unchanged
                </small>
              </div>
              <label>
                Contacts
                <select
                  value={exportScope}
                  onChange={(event) =>
                    setExportScope(event.target.value as "all" | "selected")
                  }
                >
                  <option value="all">All {contacts.length} contacts</option>
                  <option value="selected">
                    Selected {selectedIds.size} contacts
                  </option>
                </select>
              </label>
              <label>
                Version
                <select
                  value={exportVersion}
                  onChange={(event) =>
                    setExportVersion(
                      event.target.value as KnownVCardVersion | "original",
                    )
                  }
                >
                  <option value="original">Keep each original version</option>
                  <option value="2.1">vCard 2.1</option>
                  <option value="3.0">vCard 3.0</option>
                  <option value="4.0">vCard 4.0</option>
                </select>
              </label>
              <label>
                Line endings
                <select
                  value={lineEnding}
                  onChange={(event) =>
                    setLineEnding(event.target.value as "CRLF" | "LF")
                  }
                >
                  <option value="CRLF">CRLF (recommended)</option>
                  <option value="LF">LF</option>
                </select>
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={preserveUnknown}
                  onChange={(event) => setPreserveUnknown(event.target.checked)}
                />{" "}
                Preserve unknown fields
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={includePhotos}
                  onChange={(event) => setIncludePhotos(event.target.checked)}
                />{" "}
                Include photos
              </label>
              <p className="mapping-note">
                {conversionWarnings(
                  contacts,
                  exportVersion === "original" ? undefined : exportVersion,
                ).join(" ") ||
                  "Unchanged properties are retained. The simple form edits the first address, website and organization; Raw view exposes all properties."}
              </p>
              <div className="export-actions">
                <button className="text-button" onClick={downloadReport}>
                  Download report
                </button>
                <button className="primary-button compact" onClick={download}>
                  Download VCF
                </button>
              </div>
            </div>
          )}
          <div className="bulk-actions">
            <span>Bulk actions</span>
            <button onClick={addContact}>Add contact</button>
            <button onClick={cleanWhitespace}>Clean whitespace</button>
            <button onClick={removeEmpty}>Remove empty</button>
            <button onClick={() => bulkRemove("photo")}>Remove photos</button>
            <button onClick={() => bulkRemove("note")}>Remove notes</button>
            <input
              type="text"
              aria-label="Find text across contacts"
              placeholder="Find…"
              value={findText}
              onChange={(event) => setFindText(event.target.value)}
            />
            <input
              type="text"
              aria-label="Replacement text"
              placeholder="Replace with…"
              value={replaceText}
              onChange={(event) => setReplaceText(event.target.value)}
            />
            <button onClick={bulkFindReplace}>Replace all</button>
            <span className="bulk-spacer" />
            <button
              className={showWarnings ? "active-tool" : ""}
              onClick={() => setShowWarnings((value) => !value)}
            >
              Warnings <b>{issueCount}</b>
            </button>
          </div>
          <div className="editor-body">
            <aside className="contact-list">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  maxLength={65536}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setScrollTop(0);
                    if (listRef.current) listRef.current.scrollTop = 0;
                  }}
                  placeholder="Search contacts"
                  aria-label="Search names, phones, emails, companies, or notes"
                />
              </label>
              <div className="list-controls">
                <label>
                  Sort
                  <select
                    value={sortKey}
                    onChange={(event) =>
                      setSortKey(event.target.value as typeof sortKey)
                    }
                  >
                    <option value="file">File order</option>
                    <option value="name">Name</option>
                    <option value="organisation">Organization</option>
                  </select>
                </label>
                <button
                  className="text-button"
                  onClick={() =>
                    setSelectedIds(
                      new Set(filtered.map((contact) => contact.id)),
                    )
                  }
                >
                  Select shown
                </button>
                <button
                  className="text-button"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </button>
              </div>
              <div className="list-meta">
                <span>
                  {filtered.length} shown · {selectedIds.size} selected
                </span>
                <span>{parseResult?.encoding ?? "UTF-8"}</span>
              </div>
              <div
                ref={listRef}
                className="contacts-scroll"
                onKeyDown={handleListKey}
                aria-label="Contacts. Use arrow keys, Home or End to move between contacts."
                onScroll={(event) =>
                  setScrollTop(event.currentTarget.scrollTop)
                }
              >
                <div style={{ height: virtualStart * 62 }} aria-hidden="true" />
                {visibleContacts.map((contact) => (
                  <div
                    className={`contact-row ${contact.id === selectedId ? "active" : ""}`}
                    key={contact.id}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelected(contact.id)}
                      aria-label={`Select ${contact.formattedName || "unnamed contact"}`}
                    />
                    <button
                      className="contact-open"
                      data-contact-id={contact.id}
                      type="button"
                      onClick={() => selectContact(contact.id)}
                      aria-current={
                        contact.id === selectedId ? "true" : undefined
                      }
                    >
                      <span className="avatar" aria-hidden="true">
                        {(contact.formattedName || "?")
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                      <span>
                        <strong>
                          {contact.formattedName || "Unnamed contact"}
                        </strong>
                        <small>
                          {contact.organisation ||
                            contact.emails[0] ||
                            contact.phones[0] ||
                            "No details"}
                        </small>
                      </span>
                    </button>
                  </div>
                ))}
                <div
                  style={{
                    height: Math.max(0, filtered.length - virtualEnd) * 62,
                  }}
                  aria-hidden="true"
                />
                {!filtered.length && (
                  <p className="empty-list">No matching contacts.</p>
                )}
              </div>
            </aside>
            <section className="contact-detail">
              {selected ? (
                <>
                  <div className="detail-heading">
                    <div>
                      <p className="eyebrow">CONTACT DETAILS</p>
                      <h2>{selected.formattedName || "Unnamed contact"}</h2>
                    </div>
                    <div className="detail-actions">
                      <span className="version-badge">
                        vCard {selected.version}
                      </span>
                      <button
                        className="detail-button"
                        onClick={() => {
                          if (showRaw) {
                            discardDraft();
                            return;
                          }
                          const text = serializeVCard(selected);
                          setRawDraft(text);
                          setRawBaseline(text);
                          setShowRaw(true);
                        }}
                      >
                        {showRaw ? "Form view" : "Raw view"}
                      </button>
                    </div>
                  </div>
                  {showWarnings && (
                    <div className="warning-panel" role="status">
                      <strong>
                        {issueCount
                          ? `${issueCount} issue${issueCount === 1 ? "" : "s"} in this contact`
                          : "No issues in this contact"}
                      </strong>
                      {selectedIssues.slice(0, 5).map((issue, index) => (
                        <p key={`${issue.code}-${index}`}>
                          <span>{issue.severity === "error" ? "!" : "•"}</span>
                          {issue.message}
                        </p>
                      ))}
                      {issueCount > 5 && (
                        <small>
                          Showing the first 5 issues. Download the change report
                          for current warnings across the file.
                        </small>
                      )}
                    </div>
                  )}
                  {showRaw ? (
                    <div className="raw-panel">
                      <label htmlFor="raw-vcard">
                        Raw vCard for {selected.formattedName || "this contact"}
                      </label>
                      <textarea
                        id="raw-vcard"
                        maxLength={2 * 1024 * 1024}
                        value={rawDraft}
                        onChange={(event) => setRawDraft(event.target.value)}
                        rows={14}
                        spellCheck={false}
                      />
                      <div>
                        <button
                          className="secondary-button"
                          onClick={discardDraft}
                        >
                          Discard draft
                        </button>
                        <button
                          className="primary-button compact"
                          onClick={applyRaw}
                        >
                          Apply raw changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="form-grid">
                      <label>
                        First name
                        <input
                          maxLength={65536}
                          value={selected.firstName}
                          onChange={(event) =>
                            updateSelected({ firstName: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Last name
                        <input
                          maxLength={65536}
                          value={selected.lastName}
                          onChange={(event) =>
                            updateSelected({ lastName: event.target.value })
                          }
                        />
                      </label>
                      <label className="wide">
                        Formatted name
                        <input
                          maxLength={65536}
                          value={selected.formattedName}
                          onChange={(event) =>
                            updateSelected({
                              formattedName: event.target.value,
                            })
                          }
                        />
                      </label>
                      <RepeatableFields
                        label="Phone"
                        values={selected.phones}
                        types={selected.phoneTypes ?? []}
                        onChange={(phones, phoneTypes) =>
                          updateSelected({ phones, phoneTypes })
                        }
                      />
                      <RepeatableFields
                        label="Email"
                        values={selected.emails}
                        types={selected.emailTypes ?? []}
                        onChange={(emails, emailTypes) =>
                          updateSelected({ emails, emailTypes })
                        }
                      />
                      <label>
                        Organization
                        <input
                          maxLength={65536}
                          value={selected.organisation}
                          onChange={(event) =>
                            updateSelected({ organisation: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        Job title
                        <input
                          maxLength={65536}
                          value={selected.title}
                          onChange={(event) =>
                            updateSelected({ title: event.target.value })
                          }
                        />
                      </label>
                      <label className="wide">
                        Categories
                        <input
                          maxLength={65536}
                          value={selected.categories.join(", ")}
                          onChange={(event) =>
                            updateSelected({
                              categories: event.target.value
                                .split(",")
                                .map((value) => value.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </label>
                      <label className="wide">
                        Note
                        <textarea
                          maxLength={65536}
                          value={selected.note}
                          onChange={(event) =>
                            updateSelected({ note: event.target.value })
                          }
                          rows={3}
                        />
                      </label>
                    </div>
                  )}
                  {!showRaw && (
                    <details className="advanced-fields">
                      <summary>More contact details</summary>
                      <AdvancedContactFields
                        contact={selected}
                        update={updateSelected}
                      />
                    </details>
                  )}
                  <div className="detail-footer">
                    <span>
                      <span className="saved-dot" aria-hidden="true" />{" "}
                      {hasChanges
                        ? "Unsaved draft retained in this tab until reload"
                        : "Draft retained in this tab until reload"}
                    </span>
                    <button className="danger-button" onClick={deleteCurrent}>
                      Remove contact
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-detail">Select a contact to edit it.</div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
