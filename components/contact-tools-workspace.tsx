"use client";

import { downloadFile as downloadBlob } from "../lib/download";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import ContactChangePreview from "./contact-change-preview";
import { useLocalOperation } from "../lib/use-local-operation";
import { tools } from "../lib/tools-registry";
import { zipSync } from "fflate";
import {
  addCountryCode,
  changeFieldType,
  cleanNotes,
  cleanContacts,
  CleanerOptions,
  contactQuality,
  contactsToHtml,
  contactsToSql,
  contactsToText,
  contactsToTsv,
  ContactFilter,
  extractFieldValues,
  fieldFrequency,
  filterContacts,
  findDuplicateGroups,
  findDuplicateValueGroups,
  groupContactValues,
  isEmptyContact,
  mergeContactGroup,
  normalizeOrganizations,
  normalizeEmails,
  redactContacts,
  removeCountryCode,
  removeDuplicateFields,
  removeDuplicateGroups,
  repairVCardText,
  shuffleContacts,
  sortContacts,
  validateContacts,
  DuplicateGroup,
  RedactionOptions,
  ExtractionKind,
} from "../lib/contact-tools";
import {
  Contact,
  decodeVCardBytes,
  ParseResult,
  parseVCard,
  serializeVCards,
  contactProperties,
} from "../lib/vcard";
import { rowsToCsv, csvSafeValue } from "../lib/tabular";
import { createUniqueFileNamer } from "../lib/filenames";
import { guardFiles } from "../lib/file-guard";
import { trackEvent } from "../lib/analytics";

export type ContactToolMode =
  | "merge"
  | "split"
  | "split-count"
  | "split-group"
  | "dedupe"
  | "duplicate-phone"
  | "duplicate-email"
  | "cleaner"
  | "validator"
  | "repair"
  | "extract-phones"
  | "extract-emails"
  | "extract-addresses"
  | "extract-companies"
  | "extract-urls"
  | "extract-birthdays"
  | "extract-notes"
  | "extract-photos"
  | "extract-extensions"
  | "normalize-phones"
  | "add-country-code"
  | "remove-country-code"
  | "change-phone-type"
  | "change-email-type"
  | "remove-photos"
  | "remove-empty"
  | "without-phone"
  | "without-email"
  | "sort"
  | "filter"
  | "count"
  | "field-frequency"
  | "quality-score"
  | "group-company"
  | "group-domain"
  | "field-inspector"
  | "file-analyzer"
  | "redact"
  | "remove-duplicate-fields"
  | "strip-private"
  | "clean-names"
  | "normalize-emails"
  | "normalize-organizations"
  | "clean-notes"
  | "fix-fn"
  | "reverse"
  | "shuffle"
  | "vcf-to-text"
  | "vcf-to-html"
  | "vcf-to-tsv"
  | "vcf-to-sql";

const defaultCleaner: CleanerOptions = {
  trimWhitespace: true,
  normalizeEmails: false,
  normalizePhones: false,
  removePhotos: false,
  removeEmpty: false,
  countryCode: "",
};
const sampleVcf =
  "BEGIN:VCARD\nVERSION:3.0\nN:Okafor;Ada;;;\nFN:Ada Okafor\nTEL;TYPE=CELL:+234 801 234 5678\nEMAIL:ada@example.test\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nN:Mensah;Kojo;;;\nFN:Kojo Mensah\nEMAIL:kojo@example.test\nEND:VCARD";

async function readFile(file: File) {
  const decoded = decodeVCardBytes(await file.arrayBuffer());
  return {
    name: file.name,
    text: decoded.text,
    parsed: { ...parseVCard(decoded.text), encoding: decoded.encoding },
  };
}

function combineResults(results: { parsed: ParseResult }[]) {
  const contacts = results
    .flatMap((result) => result.parsed.contacts)
    .map((contact, index) => ({ ...contact, id: `contact-${index + 1}` }));
  const issues = results.flatMap((result) => result.parsed.issues);
  const versions = contacts.reduce<Record<string, number>>(
    (counts, contact) => {
      counts[contact.version] = (counts[contact.version] ?? 0) + 1;
      return counts;
    },
    {},
  );
  return {
    contacts,
    issues,
    versions,
    warnings: issues.map((issue) => issue.message),
    lineEnding: "mixed" as const,
    encoding: "UTF-8" as const,
    totalLines: results.reduce(
      (total, result) => total + result.parsed.totalLines,
      0,
    ),
  };
}

export default function ContactToolsWorkspace({
  mode,
}: {
  mode: ContactToolMode;
}) {
  const operation = useLocalOperation();
  const tool = tools.find(
    (entry) =>
      entry.workspace.kind === "contact" &&
      entry.workspace.mode === mode &&
      entry.indexable,
  );
  const config = {
    title: tool?.name ?? "Contact utility",
    description: tool?.description ?? "Review the output before downloading.",
    multiple: mode === "merge",
  };
  const [reviewDuplicates, setReviewDuplicates] = useState(false);
  const [history, setHistory] = useState<Contact[][]>([]);
  const [safeCsv, setSafeCsv] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const appendInputRef = useRef<HTMLInputElement>(null);
  const loadedResultsRef = useRef<
    { name: string; text: string; parsed: ParseResult }[]
  >([]);
  const loadedBytesRef = useRef(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [status, setStatus] = useState("Choose a VCF file to begin");
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [primaryPicks, setPrimaryPicks] = useState<Record<string, string>>({});
  const [cleaner, setCleaner] = useState<CleanerOptions>({
    ...defaultCleaner,
    normalizePhones: mode === "normalize-phones",
    removePhotos: mode === "remove-photos",
  });
  const [cleanedPreview, setCleanedPreview] = useState<Contact[] | null>(null);
  const [repairTarget, setRepairTarget] = useState<"2.1" | "3.0" | "4.0">(
    "3.0",
  );
  const [sortKey, setSortKey] = useState<
    "name" | "organisation" | "email" | "phone" | "file-order"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterKind, setFilterKind] = useState<ContactFilter>(
    mode === "without-phone"
      ? "has-phone"
      : mode === "without-email"
        ? "has-email"
        : "all",
  );
  const [filterQuery, setFilterQuery] = useState("");
  const [redaction, setRedaction] = useState<RedactionOptions>({
    removeNotes: true,
    removeAddresses: true,
    removeBirthdays: true,
    removePhotos: true,
    removeUrls: false,
    removeUnknown: true,
  });
  const [chunkSize, setChunkSize] = useState(100);
  const [countryCode, setCountryCode] = useState("");
  const [fieldType, setFieldType] = useState("CELL");

  const [strictValidation, setStrictValidation] = useState(false);
  const issues = useMemo(
    () =>
      parseResult
        ? validateContacts(contacts, parseResult, { strict: strictValidation })
        : [],
    [contacts, parseResult, strictValidation],
  );
  const extractionKind: ExtractionKind =
    mode === "extract-emails"
      ? "emails"
      : mode === "extract-addresses"
        ? "addresses"
        : mode === "extract-companies"
          ? "companies"
          : mode === "extract-urls"
            ? "urls"
            : mode === "extract-birthdays"
              ? "birthdays"
              : mode === "extract-notes"
                ? "notes"
                : mode === "extract-photos"
                  ? "photos"
                  : mode === "extract-extensions"
                    ? "extensions"
                    : "phones";
  const isExtractionMode = mode.startsWith("extract-");
  const extractionRows = useMemo(
    () => extractFieldValues(contacts, extractionKind),
    [contacts, extractionKind],
  );

  function applyLoaded(
    results: { name: string; text: string; parsed: ParseResult }[],
  ) {
    const combined =
      results.length === 1 ? results[0].parsed : combineResults(results);
    const nextContacts = combined.contacts;
    setHistory([]);
    setReviewDuplicates(false);
    setContacts(nextContacts);
    setParseResult(combined);
    setRawText(results.map((result) => result.text).join("\r\n"));
    setFileName(results.length === 1 ? results[0].name : "merged-contacts.vcf");
    setFileNames(results.map((result) => result.name));
    setGroups(findDuplicateGroups(nextContacts));
    setCleanedPreview(null);
    setPrimaryPicks({});
    setStatus(`${nextContacts.length.toLocaleString()} contacts ready`);
  }

  async function processFiles(files: FileList | File[], append = false) {
    const selectedFiles = [...files];
    if (!selectedFiles.length) return;
    const job = operation.begin();
    setCleanedPreview(null);
    const guard = guardFiles(
      selectedFiles,
      [".vcf", ".vcard"],
      append ? loadedBytesRef.current : 0,
    );
    if (!guard.ok) {
      setStatus(guard.message);
      job.fail();
      return;
    }
    if (
      selectedFiles.reduce(
        (sum, file) => sum + file.size,
        append ? loadedBytesRef.current : 0,
      ) >
      5 * 1024 * 1024
    ) {
      setStatus(
        "These utilities accept up to 5 MB at a time. Use the editor for larger files.",
      );
      job.fail();
      return;
    }
    trackEvent("file_selected", {
      tool_slug: mode,
      input_format: "vcf",
      size_bucket: guard.warning ? "large" : "standard",
    });
    trackEvent("tool_run_started", { tool_slug: mode, input_format: "vcf" });
    setStatus(guard.warning ?? "Opening contact file…");
    try {
      const read = await Promise.all(
        (config.multiple || append
          ? selectedFiles
          : selectedFiles.slice(0, 1)
        ).map(readFile),
      );
      if (!job.current()) return;
      loadedBytesRef.current =
        (append ? loadedBytesRef.current : 0) +
        (config.multiple || append
          ? selectedFiles
          : selectedFiles.slice(0, 1)
        ).reduce((total, file) => total + file.size, 0);
      if (append && loadedResultsRef.current.length) {
        const combinedResults = [...loadedResultsRef.current, ...read];
        applyLoaded(combinedResults);
        loadedResultsRef.current = combinedResults;
      } else {
        applyLoaded(read);
        loadedResultsRef.current = read;
      }
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error
            ? error.message
            : "That file could not be processed",
        );
        job.fail();
      }
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) processFiles(event.target.files);
    event.target.value = "";
  }
  function loadSample() {
    processFiles([
      new File([sampleVcf], "sample-contacts.vcf", { type: "text/vcard" }),
    ]);
    trackEvent("sample_loaded", { tool_slug: mode, source: "sample" });
  }

  function downloadVcf(nextContacts = contacts, suffix = "edited") {
    if (!nextContacts.length) {
      setStatus(
        "No contacts remain with these options. Adjust the settings or open another file.",
      );
      return;
    }
    downloadBlob(
      serializeVCards(nextContacts, {
        preserveUnknown: true,
        includePhotos: mode !== "remove-photos",
      }),
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-${suffix}.vcf`,
      "text/vcard;charset=utf-8",
    );
    trackEvent("download_clicked", {
      tool_slug: mode,
      output_format: "vcf",
      contact_count_bucket:
        nextContacts.length > 1000
          ? "1000-plus"
          : nextContacts.length > 100
            ? "101-1000"
            : "0-100",
    });
    setStatus(`Downloaded ${nextContacts.length.toLocaleString()} contacts`);
  }

  function splitDownload() {
    const files: Record<string, Uint8Array> = {};
    if (mode === "split-count") {
      const size = Math.max(1, Math.floor(chunkSize));
      for (let index = 0; index < contacts.length; index += size)
        files[
          `chunk-${String(Math.floor(index / size) + 1).padStart(3, "0")}.vcf`
        ] = new TextEncoder().encode(
          serializeVCards(contacts.slice(index, index + size), {}),
        );
    } else if (mode === "split-group") {
      const groups = new Map<string, Contact[]>();
      contacts.forEach((contact) => {
        const keys = contact.categories.length
          ? contact.categories
          : [contact.organisation || "ungrouped"];
        keys.forEach((key) =>
          groups.set(key, [...(groups.get(key) ?? []), contact]),
        );
      });
      const nameFile = createUniqueFileNamer(".vcf");
      groups.forEach((group, key) => {
        files[nameFile(key)] = new TextEncoder().encode(
          serializeVCards(group, {}),
        );
      });
    } else
      contacts.forEach((contact, index) => {
        const safeName =
          (contact.formattedName || `contact-${index + 1}`)
            .replace(/[^a-z0-9-_]+/gi, "-")
            .replace(/^-|-$/g, "") || `contact-${index + 1}`;
        files[`${String(index + 1).padStart(4, "0")}-${safeName}.vcf`] =
          new TextEncoder().encode(serializeVCards([contact], {}));
      });
    downloadBlob(
      zipSync(files) as unknown as ArrayBuffer,
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-split.zip`,
      "application/zip",
    );
    trackEvent("download_clicked", {
      tool_slug: mode,
      output_format: "zip",
      contact_count_bucket:
        contacts.length > 1000
          ? "1000-plus"
          : contacts.length > 100
            ? "101-1000"
            : "0-100",
    });
    setStatus(
      `Downloaded ${contacts.length.toLocaleString()} separate contacts`,
    );
  }

  function orderedGroup(group: DuplicateGroup): DuplicateGroup {
    const pick = primaryPicks[group.ids.join("|")];
    if (!pick || !group.ids.includes(pick) || group.ids[0] === pick)
      return group;
    return { ...group, ids: [pick, ...group.ids.filter((id) => id !== pick)] };
  }
  function removeDuplicates(group: DuplicateGroup) {
    setHistory((entries) => [...entries.slice(-19), contacts]);
    const next = removeDuplicateGroups(contacts, [orderedGroup(group)]);
    setContacts(next);
    setGroups(findDuplicateGroups(next));
    setStatus(
      "Kept the chosen primary contact. Download when your review is complete.",
    );
  }
  function mergeGroup(group: DuplicateGroup) {
    setHistory((entries) => [...entries.slice(-19), contacts]);
    const next = mergeContactGroup(
      contacts,
      group.ids,
      orderedGroup(group).ids[0],
    );
    setContacts(next);
    setGroups(findDuplicateGroups(next));
    setStatus("Merged a duplicate group");
  }
  function updateCleaner(next: CleanerOptions) {
    setCleaner(next);
    setCleanedPreview(null);
  }
  function applyCleaner() {
    const result = cleanContacts(contacts, cleaner);
    setCleanedPreview(result.contacts);
    setStatus(
      `Preview ready · ${result.contacts.length.toLocaleString()} contacts`,
    );
  }
  function commitCleaner() {
    if (!cleanedPreview) return;
    setHistory((entries) => [...entries.slice(-19), contacts]);
    setContacts(cleanedPreview);
    setGroups(findDuplicateGroups(cleanedPreview));
    downloadVcf(cleanedPreview, "cleaned");
    setCleanedPreview(null);
  }
  function repairDownload() {
    const repaired = repairVCardText(rawText, repairTarget);
    setContacts(repaired.parsed.contacts);
    setParseResult(repaired.parsed);
    downloadBlob(
      repaired.output,
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-repaired.vcf`,
      "text/vcard;charset=utf-8",
    );
    setStatus(
      `Repaired ${repaired.repairs.length} issue${repaired.repairs.length === 1 ? "" : "s"}`,
    );
  }
  function validatorReport() {
    const report = [
      "vCard validation report",
      `File: ${fileName}`,
      `Contacts: ${contacts.length}`,
      `Issues: ${issues.length}`,
      ...issues.map((issue) => `- ${issue.severity}: ${issue.message}`),
    ].join("\n");
    downloadBlob(
      report,
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-validation.txt`,
      "text/plain;charset=utf-8",
    );
  }
  function extractDownload() {
    downloadBlob(
      rowsToCsv(extractionRows, safeCsv),
      `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-${extractionKind}.csv`,
      "text/csv;charset=utf-8",
    );
    setStatus(
      `Downloaded ${extractionRows.length.toLocaleString()} ${extractionKind}`,
    );
  }
  const previewContacts = useMemo(() => {
    if (mode === "sort" || mode === "reverse")
      return sortContacts(
        contacts,
        mode === "reverse" ? "file-order" : sortKey,
        mode === "reverse" ? "desc" : sortDirection,
      );
    if (mode === "shuffle") return shuffleContacts(contacts);
    if (mode === "remove-empty")
      return contacts.filter((contact) => !isEmptyContact(contact));
    if (["filter", "without-phone", "without-email"].includes(mode))
      return filterContacts(
        contacts,
        mode === "filter"
          ? filterKind
          : mode === "without-phone"
            ? "has-phone"
            : "has-email",
        filterQuery,
      );
    if (mode === "normalize-emails") return normalizeEmails(contacts);
    if (mode === "remove-duplicate-fields")
      return removeDuplicateFields(contacts);
    if (mode === "clean-names" || mode === "fix-fn")
      return contacts.map((contact) => ({
        ...contact,
        firstName: contact.firstName.trim(),
        lastName: contact.lastName.trim(),
        forceProperties: ["FN"],
        formattedName:
          contact.formattedName.trim() ||
          [contact.firstName.trim(), contact.lastName.trim()]
            .filter(Boolean)
            .join(" "),
      }));
    if (mode === "normalize-organizations")
      return normalizeOrganizations(contacts);
    if (mode === "clean-notes") return cleanNotes(contacts);
    if (mode === "add-country-code")
      return addCountryCode(contacts, countryCode);
    if (mode === "remove-country-code")
      return removeCountryCode(contacts, countryCode);
    if (mode === "change-phone-type")
      return changeFieldType(contacts, "phone", fieldType);
    if (mode === "change-email-type")
      return changeFieldType(contacts, "email", fieldType);
    if (mode === "redact" || mode === "strip-private")
      return redactContacts(contacts, redaction);
    return contacts;
  }, [
    contacts,
    mode,
    sortKey,
    sortDirection,
    filterKind,
    filterQuery,
    redaction,
    countryCode,
    fieldType,
  ]);
  const reportPreview = useMemo((): string | null => {
    if (mode === "count" || mode === "field-frequency") {
      const report =
        mode === "count"
          ? [
              `VCF contact count report`,
              `File: ${fileName}`,
              `Contacts: ${contacts.length}`,
              `With phone: ${contacts.filter((contact) => contact.phones.length).length}`,
              `With email: ${contacts.filter((contact) => contact.emails.length).length}`,
              `With photo: ${contacts.filter((contact) => contact.photo).length}`,
              `With organisation: ${contacts.filter((contact) => contact.organisation).length}`,
            ].join("\n")
          : [
              "VCF field frequency report",
              ...fieldFrequency(contacts).map(
                (row) => `${row.field}: ${row.count} (${row.percentage}%)`,
              ),
            ].join("\n");
      return report;
    }
    if (
      mode === "duplicate-phone" ||
      mode === "duplicate-email" ||
      mode === "group-company" ||
      mode === "group-domain" ||
      mode === "quality-score" ||
      mode === "field-inspector" ||
      mode === "file-analyzer"
    ) {
      const report =
        mode === "duplicate-phone" || mode === "duplicate-email"
          ? findDuplicateValueGroups(
              contacts,
              mode === "duplicate-phone" ? "phone" : "email",
            )
              .map((group) => `${group.value}: ${group.ids.length} contacts`)
              .join("\n")
          : mode === "group-company" || mode === "group-domain"
            ? groupContactValues(
                contacts,
                mode === "group-company" ? "company" : "domain",
              )
                .map((group) => `${group.value}: ${group.count} contacts`)
                .join("\n")
            : mode === "quality-score"
              ? contactQuality(contacts)
                  .map((row) => `${row.name}: ${row.score}%`)
                  .join("\n")
              : mode === "field-inspector"
                ? contacts
                    .map((contact) =>
                      contactProperties(contact)
                        .map((property) => property.raw)
                        .join("\n"),
                    )
                    .join("\n\n")
                : [
                    `File: ${fileName}`,
                    `Contacts: ${contacts.length}`,
                    `Versions: ${Object.entries(parseResult?.versions ?? {})
                      .map(([version, count]) => `${version}=${count}`)
                      .join(", ")}`,
                    `Issues: ${issues.length}`,
                    `Unknown fields: ${contacts.reduce((total, contact) => total + contact.properties.length, 0)}`,
                  ].join("\n");
      return report || "No matching records found.";
    }
    return null;
  }, [contacts, mode, fileName, parseResult, issues]);
  const repairPreview = useMemo(() => {
    if (mode !== "repair" || !rawText) return null;
    try {
      return repairVCardText(rawText, repairTarget);
    } catch {
      return null;
    }
  }, [mode, rawText, repairTarget]);
  function utilityDownload() {
    if (reportPreview !== null) {
      downloadBlob(
        reportPreview,
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}-${mode}.txt`,
        "text/plain;charset=utf-8",
      );
      setStatus("Downloaded local report");
      return;
    }
    const next = previewContacts;
    if (mode === "vcf-to-text")
      downloadBlob(
        contactsToText(next),
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.txt`,
        "text/plain;charset=utf-8",
      );
    else if (mode === "vcf-to-html")
      downloadBlob(
        contactsToHtml(next),
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.html`,
        "text/html;charset=utf-8",
      );
    else if (mode === "vcf-to-tsv")
      downloadBlob(
        contactsToTsv(next, safeCsv),
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.tsv`,
        "text/tab-separated-values;charset=utf-8",
      );
    else if (mode === "vcf-to-sql")
      downloadBlob(
        contactsToSql(next),
        `${fileName.replace(/\.(vcf|vcard)$/i, "") || "contacts"}.sql`,
        "application/sql;charset=utf-8",
      );
    else downloadVcf(next, mode);
    if (mode.startsWith("vcf-to-"))
      setStatus(`Downloaded ${next.length.toLocaleString()} contacts`);
  }
  function reset() {
    operation.cancel();
    setHistory([]);
    setReviewDuplicates(false);
    loadedResultsRef.current = [];
    loadedBytesRef.current = 0;
    setContacts([]);
    setParseResult(null);
    setRawText("");
    setFileName("");
    setFileNames([]);
    setGroups([]);
    setPrimaryPicks({});
    setCleanedPreview(null);
    setFilterQuery("");
    setStatus("Choose a VCF file to begin");
  }

  const utilityModes = [
    "sort",
    "reverse",
    "shuffle",
    "filter",
    "remove-empty",
    "without-phone",
    "without-email",
    "count",
    "field-frequency",
    "quality-score",
    "group-company",
    "group-domain",
    "field-inspector",
    "file-analyzer",
    "duplicate-phone",
    "duplicate-email",
    "redact",
    "remove-duplicate-fields",
    "strip-private",
    "clean-names",
    "normalize-emails",
    "normalize-organizations",
    "clean-notes",
    "fix-fn",
    "add-country-code",
    "remove-country-code",
    "change-phone-type",
    "change-email-type",
    "vcf-to-text",
    "vcf-to-html",
    "vcf-to-tsv",
    "vcf-to-sql",
  ].includes(mode);
  const actionButton =
    mode === "split" || mode === "split-count" || mode === "split-group" ? (
      <button className="primary-button compact" onClick={splitDownload}>
        Download ZIP <span>↓</span>
      </button>
    ) : mode === "validator" ? (
      <button className="primary-button compact" onClick={validatorReport}>
        Download report <span>↓</span>
      </button>
    ) : mode === "repair" ? (
      <button className="primary-button compact" onClick={repairDownload}>
        Repair & download <span>↓</span>
      </button>
    ) : isExtractionMode ? (
      <button className="primary-button compact" onClick={extractDownload}>
        Download CSV <span>↓</span>
      </button>
    ) : mode === "remove-photos" ? (
      <button
        className="primary-button compact"
        onClick={() => {
          const result = cleanContacts(contacts, {
            ...defaultCleaner,
            removePhotos: true,
          });
          downloadVcf(result.contacts, "without-photos");
        }}
      >
        Download without photos <span>↓</span>
      </button>
    ) : mode === "cleaner" || mode === "normalize-phones" ? (
      <button
        className="primary-button compact"
        onClick={cleanedPreview ? commitCleaner : applyCleaner}
      >
        {cleanedPreview ? "Apply & download" : "Preview cleanup"} <span>→</span>
      </button>
    ) : utilityModes ? (
      <button className="primary-button compact" onClick={utilityDownload}>
        {[
          "count",
          "field-frequency",
          "quality-score",
          "group-company",
          "group-domain",
          "field-inspector",
          "file-analyzer",
          "duplicate-phone",
          "duplicate-email",
        ].includes(mode)
          ? "Download report"
          : mode.startsWith("vcf-to-")
            ? "Download file"
            : "Download VCF"}{" "}
        <span>↓</span>
      </button>
    ) : (
      <button
        className="primary-button compact"
        onClick={() =>
          downloadVcf(contacts, mode === "dedupe" ? "reviewed" : "merged")
        }
      >
        Download VCF <span>↓</span>
      </button>
    );

  return (
    <div className="contact-tools-card">
      <div className="conversion-toolbar">
        <span className="file-icon" aria-hidden="true">
          VCF
        </span>
        <div>
          <strong>{fileName || config.title}</strong>
          <small aria-live="polite">
            {status}
            {fileNames.length > 1 ? ` · ${fileNames.length} source files` : ""}
          </small>
        </div>
        {fileName && (
          <>
            <button className="secondary-button" onClick={reset}>
              Open another
            </button>
            {config.multiple && (
              <button
                className="secondary-button"
                onClick={() => appendInputRef.current?.click()}
              >
                Add files
              </button>
            )}
            {!operation.busy && actionButton}
          </>
        )}
      </div>
      <input
        ref={appendInputRef}
        aria-label="Add more VCF files"
        type="file"
        accept=".vcf,.vcard,text/vcard"
        multiple
        onChange={(event) => {
          if (event.target.files) processFiles(event.target.files, true);
          event.target.value = "";
        }}
        hidden
      />
      {!fileName ? (
        <div
          className="conversion-dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            processFiles(event.dataTransfer.files);
          }}
        >
          <div className="drop-icon" aria-hidden="true">
            ↥
          </div>
          <h2>Choose {config.multiple ? "VCF files" : "a VCF file"}</h2>
          <p>{config.description} Files stay in your browser.</p>
          <div className="drop-actions">
            <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
            >
              Choose VCF {config.multiple ? "files" : "file"}
            </button>
            <button className="text-button" onClick={loadSample}>
              Try a sample
            </button>
          </div>
          <input
            ref={inputRef}
            aria-label={`Choose VCF ${config.multiple ? "files" : "file"}`}
            type="file"
            accept=".vcf,.vcard,text/vcard"
            multiple={config.multiple}
            onChange={handleFile}
            hidden
          />
          <small>Local processing · no contact data upload</small>
        </div>
      ) : (
        <>
          <div className="operation-summary">
            <div>
              <span className="summary-number">
                {contacts.length.toLocaleString()}
              </span>
              <span>contacts</span>
            </div>
            <div>
              <span className="summary-number">
                {issues.length.toLocaleString()}
              </span>
              <span>validation issues</span>
            </div>
            <div>
              <span className="summary-number">
                {groups.length.toLocaleString()}
              </span>
              <span>duplicate groups</span>
            </div>
            <div>
              <span className="summary-number">
                {parseResult?.encoding ?? "UTF-8"}
              </span>
              <span>encoding</span>
            </div>
          </div>
          {history.length > 0 && (
            <button
              className="secondary-button"
              onClick={() => {
                const previous = history.at(-1)!;
                setContacts(previous);
                setGroups(findDuplicateGroups(previous));
                setHistory((entries) => entries.slice(0, -1));
                setStatus("Last change undone");
              }}
            >
              Undo last change
            </button>
          )}

          {(mode === "dedupe" || reviewDuplicates) && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">REVIEW MATCHES</p>
                  <h2>
                    {groups.length
                      ? `${groups.length} probable duplicate group${groups.length === 1 ? "" : "s"}`
                      : "No probable duplicates found"}
                  </h2>
                </div>
              </div>
              <p className="mapping-note">
                Showing up to 100 groups at a time. Review a group to reveal the
                next. Merging keeps the chosen primary name, UID and birthday,
                and combines repeatable fields.
              </p>
              <div className="duplicate-list">
                {groups.slice(0, 100).map((group, index) => {
                  const groupKey = group.ids.join("|");
                  return (
                    <div
                      className="duplicate-group"
                      key={`${group.ids.join("-")}-${index}`}
                    >
                      <div>
                        <span
                          className={`confidence confidence-${group.confidence}`}
                        >
                          {group.confidence} confidence
                        </span>
                        <p>{group.reason}</p>
                        <div className="duplicate-members">
                          {group.ids.map((id) => (
                            <span key={id}>
                              {contacts.find((contact) => contact.id === id)
                                ?.formattedName || "Unnamed contact"}
                            </span>
                          ))}
                        </div>
                        <label className="primary-pick">
                          Keep as primary
                          <select
                            value={primaryPicks[groupKey] ?? group.ids[0]}
                            onChange={(event) =>
                              setPrimaryPicks((current) => ({
                                ...current,
                                [groupKey]: event.target.value,
                              }))
                            }
                            aria-label={`Primary contact for duplicate group ${index + 1}`}
                          >
                            {group.ids.map((id) => (
                              <option value={id} key={id}>
                                {contacts.find((contact) => contact.id === id)
                                  ?.formattedName || `Contact ${id}`}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="drop-actions">
                        <button
                          className="detail-button"
                          onClick={() => mergeGroup(group)}
                        >
                          Merge group
                        </button>
                        <button
                          className="detail-button"
                          onClick={() => removeDuplicates(group)}
                        >
                          Keep primary only
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {(mode === "cleaner" ||
            mode === "normalize-phones" ||
            mode === "remove-photos") && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">CLEANING RULES</p>
                  <h2>Review before changing the file.</h2>
                </div>
              </div>
              <div className="cleaner-options">
                {mode !== "remove-photos" && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={cleaner.trimWhitespace}
                        onChange={(event) =>
                          updateCleaner({
                            ...cleaner,
                            trimWhitespace: event.target.checked,
                          })
                        }
                      />{" "}
                      Trim whitespace
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={cleaner.normalizeEmails}
                        onChange={(event) =>
                          updateCleaner({
                            ...cleaner,
                            normalizeEmails: event.target.checked,
                          })
                        }
                      />{" "}
                      Normalize email case
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={cleaner.normalizePhones}
                        onChange={(event) =>
                          updateCleaner({
                            ...cleaner,
                            normalizePhones: event.target.checked,
                          })
                        }
                      />{" "}
                      Normalize phone numbers
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={cleaner.removeEmpty}
                        onChange={(event) =>
                          updateCleaner({
                            ...cleaner,
                            removeEmpty: event.target.checked,
                          })
                        }
                      />{" "}
                      Remove empty contacts
                    </label>
                    <label>
                      Country code
                      <input
                        value={cleaner.countryCode}
                        onChange={(event) =>
                          updateCleaner({
                            ...cleaner,
                            countryCode: event.target.value,
                          })
                        }
                        placeholder="+234"
                      />
                    </label>
                  </>
                )}
                {mode === "remove-photos" && (
                  <p className="mapping-note">
                    All PHOTO properties will be removed. Other properties and
                    their labels are retained.
                  </p>
                )}
              </div>
              {cleanedPreview && (
                <p className="cleaner-result">
                  Preview: {cleanedPreview.length.toLocaleString()} contacts
                  will be exported.
                </p>
              )}
            </section>
          )}
          {mode === "validator" && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">VALIDATION RESULTS</p>
                  <h2>
                    {issues.length
                      ? `${issues.length} issue${issues.length === 1 ? "" : "s"} to review`
                      : "No issues found"}
                  </h2>
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={strictValidation}
                    onChange={(event) =>
                      setStrictValidation(event.target.checked)
                    }
                  />{" "}
                  Strict mode
                </label>
              </div>
              <p className="mapping-note">
                Strict mode treats vCard 3.0/4.0 requirements such as FN and
                VERSION as errors instead of warnings.
              </p>
              <div className="issue-list">
                {issues.slice(0, 30).map((issue, index) => (
                  <div key={`${issue.code}-${index}`}>
                    <span className={`issue-severity issue-${issue.severity}`}>
                      {issue.severity}
                    </span>
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
              {issues.length > 30 && (
                <small>
                  Showing the first 30 issues; the report includes all of them.
                </small>
              )}
            </section>
          )}
          {mode === "repair" && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">REPAIR OPTIONS</p>
                  <h2>Choose a compatible output version.</h2>
                </div>
              </div>
              <label className="repair-version">
                Output version
                <select
                  value={repairTarget}
                  onChange={(event) =>
                    setRepairTarget(event.target.value as "2.1" | "3.0" | "4.0")
                  }
                >
                  <option value="2.1">vCard 2.1</option>
                  <option value="3.0">vCard 3.0</option>
                  <option value="4.0">vCard 4.0</option>
                </select>
              </label>
              <p className="mapping-note">
                The repair pass normalizes line endings, closes an unfinished
                final card, and re-serializes parsed contacts.
              </p>
            </section>
          )}
          {isExtractionMode && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">EXTRACTION PREVIEW</p>
                  <h2>{extractionRows.length.toLocaleString()} values found</h2>
                </div>
              </div>
              <div className="extraction-preview">
                {extractionRows.slice(0, 8).map((row, index) => (
                  <div key={`${row.Value}-${index}`}>
                    <strong>
                      {csvSafeValue(row.Value, safeCsv).slice(0, 240)}
                    </strong>
                    <span>
                      {row.Contact}
                      {row.Organization ? ` · ${row.Organization}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {(mode === "sort" ||
            mode === "filter" ||
            mode === "redact" ||
            mode === "strip-private" ||
            mode === "split-count" ||
            mode === "split-group" ||
            mode === "add-country-code" ||
            mode === "remove-country-code" ||
            mode === "change-phone-type" ||
            mode === "change-email-type") && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">LOCAL OPTIONS</p>
                  <h2>Review the output before downloading.</h2>
                </div>
              </div>
              <div className="cleaner-options">
                {mode === "split-count" && (
                  <label>
                    Contacts per chunk
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      value={chunkSize}
                      onChange={(event) =>
                        setChunkSize(Number(event.target.value) || 1)
                      }
                    />
                  </label>
                )}
                {(mode === "add-country-code" ||
                  mode === "remove-country-code") && (
                  <label>
                    Country code
                    <input
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      placeholder="+234"
                    />
                  </label>
                )}
                {(mode === "change-phone-type" ||
                  mode === "change-email-type") && (
                  <label>
                    Type
                    <input
                      value={fieldType}
                      onChange={(event) =>
                        setFieldType(event.target.value.toUpperCase())
                      }
                      placeholder={
                        mode === "change-phone-type" ? "CELL" : "INTERNET"
                      }
                    />
                  </label>
                )}
                {mode === "sort" && (
                  <>
                    <label>
                      Sort by
                      <select
                        value={sortKey}
                        onChange={(event) =>
                          setSortKey(event.target.value as typeof sortKey)
                        }
                      >
                        <option value="name">Name</option>
                        <option value="organisation">Organization</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="file-order">File order</option>
                      </select>
                    </label>
                    <label>
                      Direction
                      <select
                        value={sortDirection}
                        onChange={(event) =>
                          setSortDirection(
                            event.target.value as typeof sortDirection,
                          )
                        }
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </label>
                  </>
                )}
                {mode === "filter" && (
                  <>
                    <label>
                      Keep contacts
                      <select
                        value={filterKind}
                        onChange={(event) =>
                          setFilterKind(event.target.value as ContactFilter)
                        }
                      >
                        <option value="all">All contacts</option>
                        <option value="has-phone">With phone</option>
                        <option value="without-phone">Without phone</option>
                        <option value="has-email">With email</option>
                        <option value="without-email">Without email</option>
                        <option value="has-name">With a name</option>
                        <option value="empty">Empty contacts</option>
                      </select>
                    </label>
                    <label>
                      Search contains
                      <input
                        value={filterQuery}
                        onChange={(event) => setFilterQuery(event.target.value)}
                        placeholder="name, company, email…"
                      />
                    </label>
                  </>
                )}
                {(mode === "redact" || mode === "strip-private") && (
                  <>
                    {(
                      [
                        "removeNotes",
                        "removeAddresses",
                        "removeBirthdays",
                        "removePhotos",
                        "removeUrls",
                        "removeUnknown",
                      ] as const
                    ).map((key) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={redaction[key]}
                          onChange={(event) =>
                            setRedaction({
                              ...redaction,
                              [key]: event.target.checked,
                            })
                          }
                        />{" "}
                        Remove {key.replace("remove", "").toLowerCase()}
                      </label>
                    ))}
                  </>
                )}
              </div>
              <p className="mapping-note">
                {mode === "filter"
                  ? `${filterContacts(contacts, filterKind, filterQuery).length.toLocaleString()} contacts match this filter.`
                  : mode === "sort"
                    ? "Contact blocks are retained in the selected order."
                    : mode === "split-count"
                      ? `${Math.ceil(contacts.length / Math.max(1, chunkSize))} ZIP chunks will be created.`
                      : mode === "split-group"
                        ? "One VCF will be created for each category or organization."
                        : "The original file remains unchanged. The download is a reduced local copy."}
              </p>
            </section>
          )}
          {(mode === "count" || mode === "field-frequency") && (
            <section className="operation-section">
              <div className="operation-heading">
                <div>
                  <p className="eyebrow">REPORT PREVIEW</p>
                  <h2>
                    {mode === "count"
                      ? `${contacts.length.toLocaleString()} contacts analysed`
                      : "Field usage across this file"}
                  </h2>
                </div>
              </div>
              {mode === "field-frequency" && (
                <div className="extraction-preview">
                  {fieldFrequency(contacts).map((row) => (
                    <div key={row.field}>
                      <strong>{row.field}</strong>
                      <span>
                        {row.count.toLocaleString()} contacts · {row.percentage}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {mode === "count" && (
                <p className="mapping-note">
                  {contacts
                    .filter((contact) => contact.phones.length)
                    .length.toLocaleString()}{" "}
                  with phone ·{" "}
                  {contacts
                    .filter((contact) => contact.emails.length)
                    .length.toLocaleString()}{" "}
                  with email ·{" "}
                  {contacts
                    .filter((contact) => contact.photo)
                    .length.toLocaleString()}{" "}
                  with photo.
                </p>
              )}
            </section>
          )}
          {mode !== "dedupe" &&
            mode !== "cleaner" &&
            mode !== "normalize-phones" &&
            mode !== "remove-photos" &&
            mode !== "validator" &&
            mode !== "repair" &&
            !isExtractionMode &&
            !utilityModes && (
              <section className="operation-section">
                <p className="mapping-note">
                  {contacts.length.toLocaleString()} contacts from{" "}
                  {fileNames.length || 1} source file
                  {fileNames.length === 1 ? "" : "s"}. The merged output
                  preserves unknown fields.
                </p>
                {mode === "merge" && groups.length > 0 && (
                  <p className="mapping-note">
                    {groups.length} probable duplicate group
                    {groups.length === 1 ? "" : "s"} found across these sources.{" "}
                    <button
                      className="text-button"
                      onClick={() => {
                        setReviewDuplicates(true);
                        setStatus(
                          "Reviewing duplicates in these merged contacts",
                        );
                      }}
                    >
                      Review these duplicates →
                    </button>
                  </p>
                )}
              </section>
            )}
          {(mode === "normalize-phones" ||
            mode === "add-country-code" ||
            mode === "remove-country-code" ||
            mode === "cleaner") && (
            <p className="mapping-note">
              Formatting preserves extensions. A country code is a literal
              prefix: no trunk zero is removed or invented, and 00 is not
              assumed to mean +. Review the before/after values; this is not
              regional phone validation.
            </p>
          )}
          {(isExtractionMode || mode === "vcf-to-tsv") && (
            <div className="conversion-warning">
              <label>
                <input
                  type="checkbox"
                  checked={safeCsv}
                  onChange={(event) => setSafeCsv(event.target.checked)}
                />{" "}
                Protect spreadsheet cells
              </label>
              <span>
                {safeCsv
                  ? "Formula-like values, including + phone numbers, receive an apostrophe that remains on reimport. Preview values include it."
                  : "Raw values may execute formulas when opened in a spreadsheet. Use only with a trusted data importer."}
              </span>
            </div>
          )}
          {reportPreview !== null && (
            <section className="operation-section">
              <h2>Report preview</h2>
              <pre className="report-preview">
                {reportPreview.slice(0, 20000)}
              </pre>
              {reportPreview.length > 20000 && (
                <p>
                  Preview limited to 20,000 characters. The report download
                  includes the full result.
                </p>
              )}
            </section>
          )}
          {repairPreview && (
            <section className="operation-section">
              <h2>Repair preview</h2>
              {repairPreview.repairs.map((item) => (
                <p key={item}>{item}</p>
              ))}
              <textarea
                aria-label="Repaired output preview"
                readOnly
                value={repairPreview.output.slice(0, 20000)}
                rows={8}
              />
            </section>
          )}
          {cleanedPreview && (
            <ContactChangePreview before={contacts} after={cleanedPreview} />
          )}
          {utilityModes && reportPreview === null && (
            <ContactChangePreview before={contacts} after={previewContacts} />
          )}
          {(mode === "redact" || mode === "strip-private") && (
            <p className="mapping-note">
              Retained property names:{" "}
              {[
                ...new Set(
                  previewContacts
                    .flatMap(contactProperties)
                    .map((property) => property.name),
                ),
              ].join(", ") || "none"}
              . Review the retained names, phones and emails before sharing. A
              reduced card is not anonymous.
            </p>
          )}
          {mode.startsWith("vcf-to-") && (
            <section className="operation-section">
              <h2>Export preview</h2>
              <p className="mapping-note">
                Directory/table formats include the displayed subset, not every
                vCard property. Keep the VCF source.
              </p>
              <pre className="report-preview">
                {(mode === "vcf-to-tsv"
                  ? contactsToTsv(previewContacts.slice(0, 5), safeCsv)
                  : contactsToText(previewContacts.slice(0, 5))
                ).slice(0, 20000)}
              </pre>
            </section>
          )}
        </>
      )}
    </div>
  );
}
