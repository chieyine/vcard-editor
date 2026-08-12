import { notFound } from "next/navigation";
import StandardsWorkspace from "../../../components/standards-workspace";
import ContactToolsWorkspace, { ContactToolMode } from "../../../components/contact-tools-workspace";
import VCardTextToolsWorkspace from "../../../components/vcard-text-tools-workspace";
import VCardEditor from "../../../components/vcard-editor";
import VCardViewer from "../../../components/vcard-viewer";
import VCardCreator from "../../../components/vcard-creator";
import ConversionWorkspace, { ConversionMode } from "../../../components/conversion-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import PdfWorkspace from "../../../components/pdf-workspace";
import SqliteWorkspace from "../../../components/sqlite-workspace";
import PhotoWorkspace from "../../../components/photo-workspace";
import FuzzyWorkspace from "../../../components/fuzzy-workspace";
import ToolSupportingContent from "../../../components/tool-supporting-content";

const slugs = ["vcf-to-json", "json-to-vcf", "vcard-to-jscontact", "jscontact-to-vcard", "vcard-to-jcard", "jcard-to-vcard", "vcard-to-xcard", "xcard-to-vcard", "vcf-to-ldif", "ldif-to-vcf"] as const;
type ExpansionSlug = typeof slugs[number];
const contactToolDetails: Record<string, { title: string; description: string; mode: ContactToolMode }> = {
  "remove-empty-contacts": { title: "Remove empty contacts", description: "Filter out cards with no useful contact data.", mode: "remove-empty" },
  "remove-contacts-without-phone": { title: "Remove contacts without phone numbers", description: "Keep only contacts containing at least one phone number.", mode: "without-phone" },
  "remove-contacts-without-email": { title: "Remove contacts without email", description: "Keep only contacts containing at least one email address.", mode: "without-email" },
  "sort-vcf-contacts": { title: "Sort VCF contacts", description: "Sort contact cards by name, organisation, email, phone, or file order.", mode: "sort" },
  "filter-vcf-contacts": { title: "Filter VCF contacts", description: "Keep contacts matching field-presence rules or a local search query.", mode: "filter" },
  "count-vcf-contacts": { title: "Count VCF contacts", description: "Summarise contact count and useful fields locally.", mode: "count" },
  "vcf-field-frequency": { title: "VCF field frequency", description: "See how often common vCard fields appear in a file.", mode: "field-frequency" },
  "redact-vcard": { title: "Redact a VCF", description: "Create a reduced, shareable copy by removing selected private fields.", mode: "redact" },
  "strip-private-contact-fields": { title: "Strip private contact fields", description: "Remove notes, addresses, birthdays, photos, or URLs before sharing.", mode: "strip-private" },
  "remove-duplicate-vcard-fields": { title: "Remove duplicate fields", description: "Remove repeated phone, email, and category values within each card.", mode: "remove-duplicate-fields" },
  "clean-contact-names": { title: "Clean contact names", description: "Trim names and fill missing formatted names from structured name parts.", mode: "clean-names" },
  "normalize-contact-emails": { title: "Normalize email addresses", description: "Trim whitespace, normalize case, and remove repeated email values.", mode: "normalize-emails" },
  "fix-vcard-fn": { title: "Fix blank formatted names", description: "Generate missing FN values from structured names where possible.", mode: "fix-fn" },
  "reverse-vcf-order": { title: "Reverse contact order", description: "Reverse card order without changing contact contents.", mode: "reverse" },
  "vcf-to-text": { title: "VCF to text", description: "Create a readable plain-text contact directory locally.", mode: "vcf-to-text" },
  "vcf-to-html": { title: "VCF to HTML", description: "Create a printable local HTML contact directory.", mode: "vcf-to-html" },
  "vcf-to-tsv": { title: "VCF to TSV", description: "Export contacts as tab-separated values for spreadsheets.", mode: "vcf-to-tsv" },
  "extract-addresses-from-vcf": { title: "Extract Addresses", description: "Export postal address values with contact names.", mode: "extract-addresses" },
  "extract-companies-from-vcf": { title: "Extract Companies", description: "Export organisations, departments, and titles.", mode: "extract-companies" },
  "extract-urls-from-vcf": { title: "Extract URLs", description: "Export website values without visiting them.", mode: "extract-urls" },
  "extract-birthdays-from-vcf": { title: "Extract Birthdays", description: "Export birthday values carefully as local data.", mode: "extract-birthdays" },
  "extract-notes-from-vcf": { title: "Extract Notes", description: "Export contact notes as a CSV.", mode: "extract-notes" },
  "extract-vcard-extensions": { title: "Extract vCard Extensions", description: "Report unknown X- properties without guessing their meaning.", mode: "extract-extensions" },
  "split-vcf-by-count": { title: "Split VCF by Count", description: "Create ZIP chunks containing a chosen number of contacts.", mode: "split-count" },
  "find-duplicate-phone-numbers": { title: "Find Duplicate Phone Numbers", description: "Review contacts that share a normalized phone number.", mode: "duplicate-phone" },
  "find-duplicate-emails": { title: "Find Duplicate Emails", description: "Review contacts that share a normalized email address.", mode: "duplicate-email" },
  "add-country-code-to-vcf": { title: "Add Country Code", description: "Add an explicit country code to national phone numbers.", mode: "add-country-code" },
  "remove-country-code-from-vcf": { title: "Remove Country Code", description: "Remove a specified country prefix from phone values.", mode: "remove-country-code" },
  "contact-quality-score": { title: "Contact Quality Score", description: "Report completeness signals without claiming contact truth.", mode: "quality-score" },
  "group-contacts-by-company": { title: "Group Contacts by Company", description: "Summarise contact groups by organisation.", mode: "group-company" },
  "group-contacts-by-email-domain": { title: "Group Contacts by Email Domain", description: "Summarise contact groups by email domain.", mode: "group-domain" },
  "vcf-field-inspector": { title: "VCF Field Inspector", description: "Inspect parsed properties, parameters, and unknown fields.", mode: "field-inspector" },
  "vcf-file-analyzer": { title: "VCF File Analyser", description: "Summarise versions, fields, warnings, and file structure.", mode: "file-analyzer" },
  "normalize-contact-organizations": { title: "Normalize Organisations", description: "Trim and collapse repeated whitespace in organisation fields.", mode: "normalize-organizations" },
  "clean-vcard-notes": { title: "Clean Notes", description: "Remove control characters and normalize note whitespace.", mode: "clean-notes" },
  "shuffle-vcf-contacts": { title: "Shuffle VCF Contacts", description: "Randomize card order for synthetic or test files.", mode: "shuffle" },
  "split-vcf-by-group": { title: "Split VCF by Group", description: "Create one VCF per category or organisation group.", mode: "split-group" },
  "change-vcard-phone-type": { title: "Change Phone Type", description: "Reclassify all phone values with an explicit type.", mode: "change-phone-type" },
  "change-vcard-email-type": { title: "Change Email Type", description: "Reclassify all email values with an explicit type.", mode: "change-email-type" },
  "extract-vcf-photos": { title: "Extract Contact Photos", description: "Export embedded photo values with contact names.", mode: "extract-photos" },
  "extract-phone-numbers-from-vcf": { title: "Extract Phone Numbers", description: "Export phone values with contact names.", mode: "extract-phones" },
  "extract-emails-from-vcf": { title: "Extract Emails", description: "Export email values with contact names.", mode: "extract-emails" },
};
const textToolDetails: Record<string, { title: string; description: string; mode: "folder" | "unfolder" | "generator" }> = {
  "vcard-line-folder": { title: "vCard Line Folder", description: "Fold long vCard lines correctly for standards-oriented exports.", mode: "folder" },
  "vcard-line-unfolder": { title: "vCard Line Unfolder", description: "Expand folded vCard lines for inspection.", mode: "unfolder" },
  "vcard-test-data-generator": { title: "vCard Test Data Generator", description: "Create synthetic vCard files for local development and QA.", mode: "generator" },
};
const specialToolDetails: Record<string, { title: string; description: string; kind: "editor" | "viewer" | "creator" | "conversion" | "contact" | "pdf" | "sqlite" | "photo" | "fuzzy"; mode?: ContactToolMode | ConversionMode | "to-sqlite" | "from-sqlite" | "compress" | "extract" | "view" }> = {
  "bulk-vcard-editor": { title: "Bulk vCard Editor", description: "Open a VCF and apply local edits across the contact workspace.", kind: "editor" },
  "raw-vcard-editor": { title: "Raw vCard Editor", description: "Edit vCard source text locally with parsing and validation feedback.", kind: "editor" },
  "vcf-table-viewer": { title: "Contact Table Viewer", description: "Inspect all contacts in a searchable local table.", kind: "viewer" },
  "vcf-photo-viewer": { title: "Contact Photo Viewer", description: "Inspect validated embedded contact photos without fetching remote URLs.", kind: "photo", mode: "view" },
  "download-one-vcf-contact": { title: "Download One Contact", description: "Open a multi-contact file and export a selected card locally.", kind: "viewer" },
  "extract-vcf-contacts": { title: "Extract Selected Contacts", description: "Review a VCF and continue in the local editor to export selected cards.", kind: "editor" },
  "email-signature-vcard": { title: "Email Signature vCard", description: "Create a compact professional vCard for an email signature.", kind: "creator" },
  "public-business-vcard": { title: "Public Business vCard", description: "Create a reduced business contact file with private fields removed.", kind: "contact", mode: "strip-private" },
  "print-contact-directory": { title: "Printable Contact Directory", description: "Create a print-ready HTML directory locally; use your browser's print-to-PDF flow.", kind: "contact", mode: "vcf-to-html" },
  "merge-duplicate-contacts": { title: "Merge Duplicate Contacts", description: "Review probable duplicate groups and merge fields locally.", kind: "contact", mode: "dedupe" },
  "vcf-to-pdf": { title: "VCF to PDF", description: "Generate a paginated PDF contact directory entirely in your browser.", kind: "pdf" },
  "tsv-to-vcf": { title: "TSV to VCF", description: "Map tab-separated columns into vCards locally.", kind: "conversion", mode: "tsv-to-vcf" },
  "combine-contact-files": { title: "Combine Contact Files", description: "Combine multiple local VCF files into one output.", kind: "contact", mode: "merge" },
  "compress-vcard-photos": { title: "Compress Contact Photos", description: "Resize validated embedded photos locally with reviewable limits.", kind: "photo", mode: "compress" },
  "extract-vcf-photos": { title: "Extract Contact Photos", description: "Extract validated embedded images into a local ZIP.", kind: "photo", mode: "extract" },
  "fuzzy-contact-matcher": { title: "Fuzzy Contact Matcher", description: "Review bounded similarity scores for names, organisations, phones, and emails.", kind: "fuzzy" },
  "vcf-to-sqlite": { title: "VCF to SQLite", description: "Create a real local SQLite contact database.", kind: "sqlite", mode: "to-sqlite" },
  "sqlite-to-vcf": { title: "SQLite to VCF", description: "Read a local SQLite table and export mapped vCards.", kind: "sqlite", mode: "from-sqlite" },
};

const details: Record<ExpansionSlug, { title: string; description: string; mode: Parameters<typeof StandardsWorkspace>[0]["mode"] }> = {
  "vcf-to-json": { title: "VCF to JSON", description: "Convert vCard contacts into readable JSON locally.", mode: "from-vcard-json" },
  "json-to-vcf": { title: "JSON to VCF", description: "Convert JSON contact objects into a compatible vCard file locally.", mode: "to-vcard-json" },
  "vcard-to-jscontact": { title: "vCard to JSContact", description: "Convert vCard contacts to the IETF JSON contact model locally.", mode: "from-vcard-jscontact" },
  "jscontact-to-vcard": { title: "JSContact to vCard", description: "Convert JSContact JSON into a compatible vCard file locally.", mode: "to-vcard-jscontact" },
  "vcard-to-jcard": { title: "vCard to jCard", description: "Convert vCard contacts to the direct JSON representation defined by RFC 7095.", mode: "from-vcard-jcard" },
  "jcard-to-vcard": { title: "jCard to vCard", description: "Convert jCard JSON back into a compatible vCard file locally.", mode: "to-vcard-jcard" },
  "vcard-to-xcard": { title: "vCard to xCard", description: "Convert vCard contacts to the XML representation defined by RFC 6351.", mode: "from-vcard-xcard" },
  "xcard-to-vcard": { title: "xCard to vCard", description: "Convert xCard XML back into a compatible vCard file locally.", mode: "to-vcard-xcard" },
  "vcf-to-ldif": { title: "VCF to LDIF", description: "Convert contact cards into a portable LDIF directory export locally.", mode: "from-vcard-ldif" },
  "ldif-to-vcf": { title: "LDIF to VCF", description: "Convert a simple LDIF contact export into vCard cards locally.", mode: "to-vcard-ldif" },
};

export function generateStaticParams() { return [...slugs, ...Object.keys(contactToolDetails), ...Object.keys(textToolDetails), ...Object.keys(specialToolDetails)].map((slug) => ({ slug })); }

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const entry = details[slug as ExpansionSlug] ?? contactToolDetails[slug] ?? textToolDetails[slug] ?? specialToolDetails[slug];
    if (!entry) return {};
    const title = `${entry.title} — vCard Editor`;
    return { title, description: entry.description, alternates: { canonical: `/tool/${slug}` }, openGraph: { title, description: entry.description, type: "website", url: `/tool/${slug}`, images: [{ url: "/opengraph-image", alt: `${entry.title} — vCard Editor` }] }, twitter: { card: "summary_large_image", title, description: entry.description, images: ["/opengraph-image"] } };
  });
}

export default async function ExpansionToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = details[slug as ExpansionSlug];
  const contactDetail = contactToolDetails[slug];
  const textDetail = textToolDetails[slug];
  const specialDetail = specialToolDetails[slug];
  if (!detail && !contactDetail && !textDetail && !specialDetail) notFound();
  if (specialDetail) return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONTACT WORKSPACE</p><h1>{specialDetail.title}</h1><p>{specialDetail.description}</p></div>{specialDetail.kind === "editor" ? <VCardEditor /> : specialDetail.kind === "viewer" ? <VCardViewer /> : specialDetail.kind === "creator" ? <VCardCreator /> : specialDetail.kind === "conversion" ? <ConversionWorkspace mode={specialDetail.mode as ConversionMode} /> : specialDetail.kind === "pdf" ? <PdfWorkspace /> : specialDetail.kind === "sqlite" ? <SqliteWorkspace direction={specialDetail.mode as "to-sqlite" | "from-sqlite"} /> : specialDetail.kind === "photo" ? <PhotoWorkspace mode={specialDetail.mode as "compress" | "extract" | "view"} /> : specialDetail.kind === "fuzzy" ? <FuzzyWorkspace /> : <ContactToolsWorkspace mode={specialDetail.mode as ContactToolMode} />}<ToolSupportingContent slug={slug} /></section><SiteFooter /><ToolStructuredData name={specialDetail.title} description={specialDetail.description} path={`/tool/${slug}`} /></main>;
  if (textDetail) return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">DEVELOPER FORMATS</p><h1>{textDetail.title}</h1><p>{textDetail.description}</p></div><VCardTextToolsWorkspace mode={textDetail.mode} /><ToolSupportingContent slug={slug} /></section><SiteFooter /><ToolStructuredData name={textDetail.title} description={textDetail.description} path={`/tool/${slug}`} /></main>;
  if (contactDetail) return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONTACT UTILITIES</p><h1>{contactDetail.title}</h1><p>{contactDetail.description}</p></div><ContactToolsWorkspace mode={contactDetail.mode} /><ToolSupportingContent slug={slug} /></section><SiteFooter /><ToolStructuredData name={contactDetail.title} description={contactDetail.description} path={`/tool/${slug}`} /></main>;
  if (!detail) notFound();
  return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">STANDARDS & DIRECTORY</p><h1>{detail.title}</h1><p>{detail.description}</p></div><StandardsWorkspace mode={detail.mode} /><ToolSupportingContent slug={slug} /></section><SiteFooter /><ToolStructuredData name={detail.title} description={detail.description} path={`/tool/${slug}`} /></main>;
}
