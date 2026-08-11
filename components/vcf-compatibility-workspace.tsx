"use client";

import { ChangeEvent, useState } from "react";
import { guardFile } from "../lib/file-guard";
import { decodeVCardBytes, parseVCard } from "../lib/vcard";
import { validateContacts } from "../lib/contact-tools";
import { trackEvent } from "../lib/analytics";

const profiles = { google: "Google Contacts", apple: "Apple Contacts / iCloud", outlook: "Outlook", android: "Android Contacts" } as const;

export default function VcfCompatibilityWorkspace() {
  const [profile, setProfile] = useState<keyof typeof profiles>("google"); const [report, setReport] = useState<string[]>([]); const [status, setStatus] = useState("Choose a VCF file to check");
  function inspect(text: string) { const parsed = parseVCard(text); const issues = validateContacts(parsed.contacts, parsed); const versions = Object.entries(parsed.versions).map(([version, count]) => `${count} v${version}`).join(" · "); const next = [`Profile: ${profiles[profile]}`, `Contacts: ${parsed.contacts.length}`, `Versions: ${versions || "none"}`, `Encoding: ${parsed.encoding}`, `Warnings: ${issues.length}`, parsed.contacts.some((contact) => contact.photo) ? "Embedded photos found: review destination limits." : "No embedded photos found.", parsed.contacts.some((contact) => contact.properties.length) ? "Unknown vendor fields found: preserve a source backup." : "No unknown vendor fields found."]; setReport(next); setStatus("Profile check ready · this is a conservative local report, not a guarantee of import success"); trackEvent("tool_run_succeeded", { tool_slug: "vcf-compatibility-checker", input_format: "vcf" }); }
  function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; const guard = guardFile(file, [".vcf", ".vcard"]); if (!guard.ok) { setStatus(guard.message); return; } const reader = new FileReader(); reader.onload = () => { if (reader.result instanceof ArrayBuffer) inspect(decodeVCardBytes(reader.result).text); }; reader.onerror = () => setStatus("Could not read that file"); reader.readAsArrayBuffer(file); trackEvent("file_selected", { tool_slug: "vcf-compatibility-checker", input_format: "vcf", size_bucket: file.size > 8 * 1024 * 1024 ? "large" : "standard" }); }
  return <div className="compatibility-card"><div className="conversion-toolbar"><span className="file-icon">VCF</span><div><strong>Compatibility check</strong><small aria-live="polite">{status}</small></div></div><div className="operation-section"><label className="repair-version">Destination profile<select value={profile} onChange={(event) => setProfile(event.target.value as keyof typeof profiles)}>{Object.entries(profiles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="primary-button compatibility-file">Choose VCF<input type="file" accept=".vcf,.vcard,text/vcard" onChange={handleFile} hidden /></label><p className="mapping-note">Profiles summarize local syntax and field signals. They do not replace a dated import test on the destination platform.</p></div>{report.length > 0 && <section className="operation-section"><div className="issue-list">{report.map((item) => <div key={item}><span className="issue-severity issue-warning">info</span><span>{item}</span></div>)}</div></section>}</div>;
}

