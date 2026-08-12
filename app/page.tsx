import VCardEditor from "../components/vcard-editor";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import Link from "next/link";
import { WebsiteStructuredData } from "../components/structured-data";
import { guides } from "../lib/content-registry";
import { tools } from "../lib/tools-registry";
import { happyCsvUrl } from "../lib/site-config";
import ReferralLink from "../components/referral-link";

const jobs = [
  { label: "Convert VCF to CSV", hint: "Turn contact cards into spreadsheet rows", href: "/tool/vcf-to-csv" },
  { label: "Convert VCF to Excel", hint: "Open contacts as a workbook", href: "/tool/vcf-to-excel" },
  { label: "CSV to VCF", hint: "Map spreadsheet columns to contacts", href: "/tool/csv-to-vcf" },
  { label: "Excel to VCF", hint: "Create an importable contact file", href: "/tool/excel-to-vcf" },
];

const categories = ["Open & Edit", "Convert", "Merge & Split", "Clean & Repair", "Extract & Transform", "Create & Share", "Developer Formats"] as const;
const discoverableTools = tools.filter((tool) => tool.indexable);

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="content">
        <div className="hero-copy">
          <p className="eyebrow">CONTACT FILE WORKSPACE</p>
          <h1>Edit, convert, and clean <em>vCard</em> files.</h1>
          <p className="hero-lede">
            Open VCF files, fix contact details, and export a compatible vCard. Your file is processed locally in this browser.
          </p>
          <div className="trust-row" aria-label="Product benefits">
            <span>Local processing</span><span>No account</span><span>Free to use</span>
          </div>
        </div>
        <VCardEditor />
      </section>

      <section className="jobs-section" id="popular" aria-labelledby="jobs-heading">
        <div className="section-heading">
          <div><p className="eyebrow">START WITH A JOB</p><h2 id="jobs-heading">Popular contact-file workflows</h2></div>
          <p>Small, focused tools for the moments when contacts refuse to cooperate.</p>
        </div>
        <div className="job-grid">
          {jobs.map((job, index) => <Link className="job-card" href={job.href} key={job.label}>
            <span className="job-number">0{index + 1}</span><span><strong>{job.label}</strong><small>{job.hint}</small></span><span className="arrow" aria-hidden="true">↗</span>
          </Link>)}
        </div>
      </section>

      <section className="home-categories" aria-labelledby="categories-heading">
        <div className="section-heading"><div><p className="eyebrow">EVERY CONTACT-FILE JOB</p><h2 id="categories-heading">One private workspace, focused tools.</h2></div><Link className="text-button" href="/tools">Browse all {discoverableTools.length} tools →</Link></div>
        <div className="category-grid">{categories.map((category) => { const examples = discoverableTools.filter((tool) => tool.category === category).slice(0, 3); return <article key={category}><span>{String(discoverableTools.filter((tool) => tool.category === category).length).padStart(2, "0")}</span><h3>{category}</h3><div>{examples.map((tool) => <Link href={`/tool/${tool.slug}`} key={tool.slug}>{tool.name}<span aria-hidden="true">↗</span></Link>)}</div></article>; })}</div>
      </section>

      <section className="privacy-story" aria-labelledby="privacy-heading"><div><p className="eyebrow">PRIVATE BY ARCHITECTURE</p><h2 id="privacy-heading">Your address book stays yours.</h2><p>Files are parsed, transformed, and packaged by code running in this browser. The tools do not send contact-file contents, filenames, names, phone numbers, or notes to an application server.</p><div className="privacy-links"><Link href="/how-it-works">Inspect how it works</Link><Link href="/security">Read the security model</Link></div></div><div className="privacy-flow" aria-label="Local processing flow"><span>Your file</span><b aria-hidden="true">→</b><span>This browser</span><b aria-hidden="true">→</b><span>Your download</span><small>No contact-data server step</small></div></section>

      <section className="compatibility-overview" aria-labelledby="compatibility-heading"><div className="section-heading"><div><p className="eyebrow">COMPATIBILITY, WITHOUT OVERPROMISING</p><h2 id="compatibility-heading">Prepare once. Test the destination.</h2></div><Link className="text-button" href="/platform/compatibility-matrix">View the compatibility matrix →</Link></div><div className="compatibility-grid"><article><span>01</span><h3>Common versions</h3><p>Inspect and convert vCard 2.1, 3.0, and 4.0 with warnings when fields need transformation.</p></article><article><span>02</span><h3>Platform profiles</h3><p>Use conservative Google, Apple, Outlook, and Android workflows built around synthetic fixtures and dated evidence.</p></article><article><span>03</span><h3>Small import first</h3><p>Keep the source backup, validate a copy, and test representative contacts before moving a complete address book.</p></article></div></section>

      <section className="guide-preview" aria-labelledby="guide-heading"><div className="section-heading"><div><p className="eyebrow">PRACTICAL GUIDANCE</p><h2 id="guide-heading">Solve the import, not just the file.</h2></div><Link className="text-button" href="/guide">View all guides →</Link></div><div className="guide-preview-grid">{guides.slice(0, 6).map((guide) => <Link href={`/guide/${guide.slug}`} key={guide.slug}><span>{guide.lastReviewed}</span><strong>{guide.title}</strong><p>{guide.description}</p><b aria-hidden="true">Read guide ↗</b></Link>)}</div></section>

      <section className="portfolio-link" aria-labelledby="portfolio-heading"><div><p className="eyebrow">KEEP WORKING WITH YOUR CSV</p><h2 id="portfolio-heading">Need spreadsheet cleanup after conversion?</h2><p>Send the downloaded CSV to HappyCSV for delimiter checks, column cleanup, and spreadsheet-focused review. The file transfer stays explicit: download here, then choose it there.</p></div><ReferralLink className="primary-button" href={happyCsvUrl}>Continue to HappyCSV <span aria-hidden="true">↗</span></ReferralLink></section>

      <section className="how-section" id="how-it-works" aria-labelledby="how-heading">
        <div><p className="eyebrow">A CALMER WAY TO MOVE CONTACTS</p><h2 id="how-heading">A useful preview before every download.</h2></div>
        <div className="how-grid"><div><span className="step">01</span><h3>Open locally</h3><p>Choose a .vcf or .vcard file. Nothing is sent to an application server.</p></div><div><span className="step">02</span><h3>Make the change</h3><p>Search contacts, edit the details that matter, and keep the rest intact.</p></div><div><span className="step">03</span><h3>Export with confidence</h3><p>Review counts and warnings before downloading your updated file.</p></div></div>
      </section>

      <SiteFooter />
      <WebsiteStructuredData />
    </main>
  );
}
