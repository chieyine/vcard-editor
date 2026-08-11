# vCardEditor.com

> **Master product, engineering, content, SEO, privacy, security, monetisation, and launch specification**
>
> Domain: `vcardeditor.com`  
> Working brand: **vCard Editor**  
> Primary category: browser-based vCard and VCF contact-file tools  
> Business model: free utility site, organic search acquisition, privacy-first local processing, carefully placed advertising after quality and policy readiness  
> Document status: master blueprint  
> Last researched: 11 August 2026

---

## 1. Purpose of this document

This README is the single source of truth for building and operating **vCardEditor.com**. It is intentionally broader than a normal repository README. It combines:

- product requirements;
- the complete initial and long-term tool catalogue;
- user experience rules;
- vCard and VCF parsing requirements;
- technical architecture;
- security and privacy controls;
- search-engine optimisation;
- content strategy;
- analytics and measurement;
- advertising and monetisation rules;
- accessibility;
- testing;
- release management;
- launch and growth plans;
- integration with HappyCSV and the wider utility-site portfolio.

A developer, designer, writer, SEO specialist, security reviewer, or coding agent should be able to use this document to understand what the site is meant to become and what must not be compromised while building it.

This is not a licence to build every idea immediately. The document distinguishes launch requirements from later opportunities. The first version should be focused, fast, correct, private, and genuinely useful.

---

## 2. Executive summary

vCardEditor.com should become the most dependable browser-based workspace for opening, editing, converting, cleaning, repairing, and organising vCard contact files.

The flagship product is a full **vCard/VCF editor** that lets a user choose a `.vcf` or `.vcard` file, inspect all contacts in a spreadsheet-like interface, correct fields, remove unwanted entries, clean duplicates, review validation warnings, and export a compatible file. It must work without requiring an account and should process contact data locally in the browser.

Around the flagship editor, the site should offer focused landing pages for common jobs such as:

- VCF to CSV;
- CSV to VCF;
- VCF to Excel;
- Excel to VCF;
- merge VCF files;
- split a multi-contact VCF;
- remove duplicate contacts;
- convert vCard versions;
- repair malformed VCF files;
- fix character encoding;
- extract phone numbers or email addresses;
- import spreadsheet contacts into iPhone, Android, Google Contacts, iCloud, or Outlook.

The site should not be another thin converter directory. Its main advantages should be:

1. **Real editing and diagnostics**, not just format conversion.
2. **Standards-aware parsing**, with clear handling of vCard 2.1, 3.0, and 4.0.
3. **Loss-aware conversion**, so users are warned before fields are changed or dropped.
4. **Local processing**, with no contact-file uploads to the application server.
5. **Review-first cleaning**, especially for duplicate detection and destructive actions.
6. **Useful explanations based on tested workflows**, not generic SEO filler.
7. **Excellent support for messy files from real phones, email clients, and contact platforms.**
8. **A durable SEO structure**, with one strong page per genuine user job and no mass production of near-duplicate pages.

The desired long-term position is:

> **vCard Editor: open, edit, convert, clean, and repair contact files privately in your browser.**

---

## 3. Product thesis

### 3.1 The problem

Contact files look simple until users try to move them between systems. Common failures include:

- an app refuses to import a VCF file;
- a file contains hundreds or thousands of contacts and cannot be edited conveniently;
- phone numbers appear in the wrong fields;
- names, accents, or non-Latin characters become corrupted;
- contacts are duplicated after multiple imports;
- one multi-contact VCF must be split into separate cards;
- hundreds of separate VCF files must be combined;
- a spreadsheet must be converted into a phone-compatible vCard;
- one platform expects vCard 2.1 while another exported 3.0 or 4.0;
- photos make the file very large;
- custom or unknown fields disappear during conversion;
- existing online converters send sensitive contact data to a remote server;
- downloadable software is Windows-only, paid, untrusted, or unnecessarily complicated.

These are high-intent problems. The user is usually trying to complete a migration, restore a backup, clean a contact list, or open an unfamiliar file. The value of the product comes from solving that immediate job safely and accurately.

### 3.2 Why this can work as a utility-site portfolio asset

The niche has characteristics similar to HappyCSV:

- it is boring but necessary;
- users search for specific actions;
- there are many legitimate long-tail problems;
- processing can usually happen in the browser;
- the audience is global;
- the site can rank through working tools and tested guides;
- infrastructure costs can remain low;
- the site can support advertising without forcing users into an account;
- a small number of pages can reveal which subtopics deserve deeper investment.

The domain is descriptive, but the name alone will not carry the site. Search engines treat domain words as only one relevance signal and have systems intended to prevent exact-match domains from receiving excessive credit. The domain is useful mainly because it is clear, memorable, and directly aligned with a real task.

### 3.3 North-star outcome

A user should be able to arrive from search, solve a contact-file problem within a few minutes, understand what changed, download a safe output, and leave with confidence that the file never went to the application's server.

### 3.4 Business objective

The initial commercial objective is an advertising-supported utility site. Revenue should be treated as the result of useful traffic, not the reason to compromise the tool.

The long-term portfolio objective is to let vCardEditor.com contribute organic traffic and advertising income alongside HappyCSV and other focused utility sites. The property does not have to become a giant SaaS company to be successful. A site that attracts several thousand to tens of thousands of useful monthly visits can be valuable within the portfolio.

---

## 4. Brand and positioning

### 4.1 Brand name

Use **vCard Editor** as the visible name.

Capitalisation:

- Preferred brand form: `vCard Editor`
- Acceptable sentence form: `vCard editor`
- File-format term: `VCF`
- Avoid branding the company as `VCF Tools`, because VCF is also widely used to mean Variant Call Format in genomics.

### 4.2 Primary message

Recommended homepage H1:

> **Edit, convert, and clean vCard contact files.**

Recommended subheading:

> Open VCF files, fix contact details, remove duplicates, convert CSV or Excel, and export a compatible vCard. Your contact file stays in your browser.

Recommended trust line:

> Local processing · No account · Free to use

Primary call to action:

> **Choose a VCF file**

Secondary call to action:

> **Try a sample file**

### 4.3 Positioning statement

> For people who need to move or repair contacts, vCard Editor is a private browser-based workspace that opens, edits, converts, validates, and cleans VCF files without requiring software installation or sending the contact file to the application server.

### 4.4 Tone

The site should sound calm, practical, and technically competent.

Use:

- short explanations;
- plain language;
- honest limitations;
- direct error messages;
- specific compatibility notes;
- visible warnings before irreversible changes.

Avoid:

- exaggerated claims such as “100% accurate”;
- “unlimited” unless the product truly has no meaningful limit;
- claims of compatibility that have not been tested;
- fear-based security marketing;
- fake urgency;
- keyword-stuffed headings;
- phrases suggesting affiliation with Apple, Google, Microsoft, Android, Outlook, WhatsApp, or other platforms.

### 4.5 Visual direction

The visual system should feel like a serious data tool rather than a novelty converter.

Recommended characteristics:

- clean typography;
- restrained interface;
- generous spacing;
- strong table readability;
- obvious focus states;
- clear warnings and validation states;
- no animated background effects;
- no oversized hero that pushes the tool below the fold;
- no misleading green “Download” advertising near the real download control;
- responsive, but desktop-first for complex editing;
- accessible light and dark modes if dark mode can be implemented without delaying launch.

### 4.6 Domain and canonical host

Use one canonical host:

`https://vcardeditor.com`

Redirect all variants permanently:

- `http://vcardeditor.com` → `https://vcardeditor.com`
- `http://www.vcardeditor.com` → `https://vcardeditor.com`
- `https://www.vcardeditor.com` → `https://vcardeditor.com`

Do not allow both apex and `www` versions to remain indexable.

---

## 5. Users and jobs to be done

### 5.1 Main user groups

#### A. Everyday phone user

Typical jobs:

- transfer contacts from an old phone to a new phone;
- convert a spreadsheet into phone contacts;
- open a VCF received by email;
- remove duplicates before importing;
- split or merge backup files.

Needs:

- simple language;
- platform-specific instructions;
- safe defaults;
- no software installation;
- reassurance that contact data is private.

#### B. Office administrator or small-business operator

Typical jobs:

- import customer or staff contacts from Excel;
- clean inconsistent phone numbers;
- combine contact lists;
- remove duplicates;
- export contacts for a CRM or mailing system;
- make a printable directory.

Needs:

- bulk processing;
- mapping controls;
- previews;
- repeatable presets;
- clear reports of changes.

#### C. IT support technician

Typical jobs:

- repair a malformed file;
- convert between vCard versions;
- diagnose why a platform rejects a VCF;
- preserve custom fields;
- compare two exports;
- process large contact sets.

Needs:

- diagnostics;
- raw view;
- field-level warnings;
- loss reports;
- version controls;
- deterministic output.

#### D. Developer or data specialist

Typical jobs:

- inspect vCard structure;
- convert to JSON, JSContact, jCard, xCard, CSV, or LDIF;
- validate files against standards;
- generate fixtures;
- analyse unknown `X-` properties;
- test round-trip behaviour.

Needs:

- raw output;
- documented mappings;
- export options;
- standards references;
- predictable APIs inside the codebase.

#### E. Privacy-conscious user

Typical jobs:

- process contact files without handing the address book to a third party;
- remove private notes, photos, addresses, or metadata before sharing;
- create a public-safe business card.

Needs:

- verifiable local processing;
- no contact-data logging;
- redaction tools;
- transparent data-flow documentation.

### 5.2 Core jobs

The product should be designed around verbs, not file types:

- open;
- inspect;
- edit;
- create;
- map;
- convert;
- merge;
- split;
- compare;
- validate;
- repair;
- deduplicate;
- normalise;
- filter;
- extract;
- redact;
- share;
- export.

---

## 6. Product principles

1. **The contact file stays local by default.**
2. **The tool must explain what it changed.**
3. **Destructive actions require review or an explicit confirmation.**
4. **Unknown fields should be preserved whenever possible.**
5. **Version downgrades must disclose possible data loss.**
6. **The interface must remain responsive during large operations.**
7. **A working sample must be available on every major tool.**
8. **The tool appears before long explanatory content.**
9. **Every indexable page must solve a distinct job.**
10. **Compatibility claims require repeatable tests.**
11. **No user account is required for the core product.**
12. **No third-party script may receive file contents, contact values, or filenames.**
13. **Advertising must never resemble a file action.**
14. **Errors should tell the user what can be done next.**
15. **Accessibility is part of product quality, not a later add-on.**
16. **The codebase should be reusable across the wider utility-site portfolio without making every site look identical.**

---

## 7. Scope and non-goals

### 7.1 In scope

- local parsing and serialisation of VCF/vCard files;
- support for common vCard 2.1, 3.0, and 4.0 files;
- viewing and editing individual or multiple contacts;
- file conversion;
- field mapping;
- duplicate detection and review;
- validation and repair;
- privacy-safe analysis;
- synthetic sample files;
- platform-specific import and export guidance;
- original guides and reference content;
- advertising after quality and compliance readiness;
- optional locally stored preferences and mapping presets;
- optional installable PWA after the web product is stable.

### 7.2 Explicit non-goals for launch

Do not build these into the initial product:

- cloud storage of contact files;
- user accounts;
- synchronisation with a user's live Google, Apple, Microsoft, or phone address book;
- CardDAV server access;
- scraping contacts from websites or social networks;
- bulk WhatsApp messaging;
- email campaigns;
- phone-number enrichment or identity lookup;
- contact-data resale;
- remote AI enrichment;
- server-side conversion of private files;
- “verify whether this email exists” claims;
- “verify whether this phone number is active” claims;
- mass-generated city, country, or platform doorway pages;
- 100 near-identical version-conversion pages;
- a paid plan before free demand is proven;
- an API that requires users to upload files to the server;
- browser extensions or native apps before the core website works well.

### 7.3 Future possibilities, only after validation

- offline desktop wrapper;
- command-line tool;
- local folder batch processing;
- encrypted local project files;
- optional paid one-time desktop licence;
- private team deployment;
- client-side mapping preset library;
- open-source parser or test-fixture repository;
- CardDAV utilities with clear consent and isolated credentials;
- paid support for very specialised enterprise migration workflows.

---

## 8. Information architecture

### 8.1 Primary route structure

Use a simple, stable route model:

```text
/
/tool/<tool-slug>
/guide/<guide-slug>
/format/<format-or-version-slug>
/platform/<platform-workflow-slug>
/about
/author
/privacy
/security
/how-it-works
/browser-support
/terms
/cookies
/contact
/changelog
/sitemap
```

Recommended examples:

```text
/tool/vcf-editor
/tool/vcf-to-csv
/tool/csv-to-vcf
/tool/merge-vcf
/tool/split-vcf
/tool/remove-duplicate-contacts
/tool/vcard-version-converter
/guide/how-to-open-a-vcf-file
/guide/vcf-file-wont-import
/format/vcard-4-0
/platform/google-contacts-import-vcf
/platform/iphone-import-vcf
```

### 8.2 Main navigation

Desktop header:

- vCard Editor logo/home;
- Edit;
- Convert;
- Clean & Repair;
- Organise;
- Guides;
- Search tools.

Mobile header:

- logo;
- tool search;
- menu.

### 8.3 Footer

Include:

- short privacy statement;
- Tools;
- Guides;
- Formats;
- About;
- Author;
- How it works;
- Security;
- Browser support;
- Privacy;
- Cookies;
- Terms;
- Contact;
- Changelog;
- HTML sitemap.

### 8.4 Homepage sections

1. concise hero with file chooser and sample;
2. trust statements;
3. popular jobs;
4. categories;
5. flagship editor explanation;
6. compatibility overview;
7. privacy and local-processing explanation;
8. latest or most useful guides;
9. related HappyCSV workflow link where relevant;
10. restrained footer.

### 8.5 Tool categories

- **Open & Edit**
- **Convert**
- **Merge & Split**
- **Clean & Deduplicate**
- **Validate & Repair**
- **Extract & Transform**
- **Create & Share**
- **Developer Formats**
- **Platform Workflows**

---

## 9. Complete product catalogue

This section lists the complete opportunity set. Priority labels:

- **P0**: launch-critical;
- **P1**: first growth wave;
- **P2**: valuable expansion;
- **P3**: experimental or advanced;
- **Guide**: content-led page that may reuse an existing tool rather than create a separate processor.

### 9.1 Open and edit

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | Full vCard Editor | `/tool/vcf-editor` | Open a VCF, edit contacts in bulk, validate, and export |
| P0 | VCF Viewer | `/tool/vcf-viewer` | Read one or many contacts without editing |
| P0 | vCard Creator | `/tool/vcard-creator` | Create a new contact and download a VCF |
| P1 | Bulk vCard Editor | `/tool/bulk-vcard-editor` | Edit a selected field across many contacts |
| P1 | Raw vCard Editor | `/tool/raw-vcard-editor` | Edit source text with parsing and validation feedback |
| P2 | Contact Table Viewer | `/tool/vcf-table-viewer` | View all cards as a virtualised spreadsheet |
| P2 | Contact Photo Viewer | `/tool/vcf-photo-viewer` | Inspect embedded contact photos safely |
| P2 | VCF Field Inspector | `/tool/vcf-field-inspector` | Show properties, parameters, encodings, and unknown fields |
| P2 | VCF File Analyser | `/tool/vcf-file-analyzer` | Summarise versions, contact count, properties, errors, and file size |
| P3 | Side-by-side Raw and Form View | part of editor | Compare source lines with interpreted fields |

### 9.2 Core conversion

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | VCF to CSV | `/tool/vcf-to-csv` | Convert contact cards into rows and columns |
| P0 | CSV to VCF | `/tool/csv-to-vcf` | Map spreadsheet columns to vCard fields |
| P0 | VCF to Excel | `/tool/vcf-to-excel` | Export contacts as `.xlsx` |
| P0 | Excel to VCF | `/tool/excel-to-vcf` | Convert `.xlsx` contacts to importable VCF |
| P1 | VCF to JSON | `/tool/vcf-to-json` | Convert contact data into readable JSON |
| P1 | JSON to VCF | `/tool/json-to-vcf` | Map JSON contact objects into vCards |
| P1 | VCF to Text | `/tool/vcf-to-text` | Produce a plain readable contact list |
| P1 | VCF to HTML | `/tool/vcf-to-html` | Produce a printable local HTML directory |
| P2 | VCF to PDF | `/tool/vcf-to-pdf` | Generate a printable contact directory locally |
| P2 | VCF to LDIF | `/tool/vcf-to-ldif` | Convert for directory or legacy workflows |
| P2 | LDIF to VCF | `/tool/ldif-to-vcf` | Convert directory exports into vCards |
| P2 | VCF to TSV | `/tool/vcf-to-tsv` | Export tab-separated contact data |
| P2 | TSV to VCF | `/tool/tsv-to-vcf` | Convert tabular contacts into vCards |
| P3 | VCF to SQLite | `/tool/vcf-to-sqlite` | Create a local contact database file |
| P3 | SQLite to VCF | `/tool/sqlite-to-vcf` | Map a local table to vCards |

### 9.3 Standards and developer conversion

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P1 | vCard to JSContact | `/tool/vcard-to-jscontact` | Convert to the IETF JSON contact model |
| P1 | JSContact to vCard | `/tool/jscontact-to-vcard` | Convert standard JSON contact data to vCard |
| P2 | vCard to jCard | `/tool/vcard-to-jcard` | Convert to the direct JSON representation |
| P2 | jCard to vCard | `/tool/jcard-to-vcard` | Convert jCard back to vCard |
| P2 | vCard to xCard | `/tool/vcard-to-xcard` | Convert to the XML representation |
| P2 | xCard to vCard | `/tool/xcard-to-vcard` | Convert XML contact data to vCard |
| P2 | vCard Property Reference | `/format/vcard-properties` | Explain recognised fields and parameters |
| P3 | Generate vCard Test Data | `/tool/vcard-test-data-generator` | Create synthetic files for development and QA |
| P3 | vCard Line Folder | `/tool/vcard-line-folder` | Fold long lines correctly |
| P3 | vCard Line Unfolder | `/tool/vcard-line-unfolder` | Expand folded lines for inspection |

### 9.4 Merge, split, and organise

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | Merge VCF Files | `/tool/merge-vcf` | Combine multiple files into one multi-contact VCF |
| P0 | Split VCF File | `/tool/split-vcf` | Separate each contact into its own file or ZIP |
| P1 | Split VCF by Count | `/tool/split-vcf-by-count` | Create chunks of a selected number of contacts |
| P1 | Split VCF by Group | `/tool/split-vcf-by-group` | Separate contacts using categories or groups |
| P1 | Sort VCF Contacts | `/tool/sort-vcf-contacts` | Sort by name, company, email, or phone |
| P1 | Filter VCF Contacts | `/tool/filter-vcf-contacts` | Keep or remove cards matching conditions |
| P1 | Extract Selected Contacts | `/tool/extract-vcf-contacts` | Select specific contacts and export them |
| P1 | Compare VCF Files | `/tool/compare-vcf-files` | Find added, removed, and changed contacts |
| P2 | Combine CSV and VCF Contacts | `/tool/combine-contact-files` | Normalise mixed contact sources into one output |
| P2 | Group Contacts by Company | `/tool/group-contacts-by-company` | Organise contacts into company-based groups |
| P2 | Group Contacts by Domain | `/tool/group-contacts-by-email-domain` | Group by email domain |
| P2 | Reverse Contact Order | `/tool/reverse-vcf-order` | Reverse card order without changing contents |
| P3 | Shuffle Contacts | `/tool/shuffle-vcf-contacts` | Randomise synthetic or test files only |

### 9.5 Deduplication and cleaning

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | Remove Duplicate Contacts | `/tool/remove-duplicate-contacts` | Review and remove duplicate cards |
| P0 | Contact Cleaner | `/tool/contact-cleaner` | Diagnose and fix common contact problems |
| P1 | Merge Duplicate Contacts | `/tool/merge-duplicate-contacts` | Combine fields from probable duplicates |
| P1 | Find Duplicate Phone Numbers | `/tool/find-duplicate-phone-numbers` | Identify contacts sharing a phone number |
| P1 | Find Duplicate Emails | `/tool/find-duplicate-emails` | Identify contacts sharing an email address |
| P1 | Normalise Phone Numbers | `/tool/normalize-phone-numbers` | Standardise formatting with explicit country rules |
| P1 | Clean Contact Names | `/tool/clean-contact-names` | Trim whitespace and correct obvious formatting issues |
| P1 | Remove Empty Contacts | `/tool/remove-empty-contacts` | Remove cards with no useful contact data |
| P1 | Remove Contacts Without Phone Numbers | `/tool/remove-contacts-without-phone` | Filter phone-less cards |
| P1 | Remove Contacts Without Email | `/tool/remove-contacts-without-email` | Filter email-less cards |
| P1 | Remove Contact Photos | `/tool/remove-vcf-photos` | Reduce file size and remove images |
| P1 | Strip Private Fields | `/tool/strip-private-contact-fields` | Remove notes, addresses, birthdays, or selected fields |
| P1 | Contact Redactor | `/tool/redact-vcard` | Produce a shareable reduced contact file |
| P2 | Normalise Email Addresses | `/tool/normalize-contact-emails` | Trim, validate syntax, and deduplicate emails |
| P2 | Normalise Organisations | `/tool/normalize-contact-organizations` | Standardise company and department values |
| P2 | Fix Blank Formatted Names | `/tool/fix-vcard-fn` | Generate or repair missing `FN` values |
| P2 | Clean Notes | `/tool/clean-vcard-notes` | Remove control characters and normalise line breaks |
| P2 | Compress Contact Photos | `/tool/compress-vcard-photos` | Resize embedded images locally |
| P2 | Remove Exact Duplicate Fields | `/tool/remove-duplicate-vcard-fields` | Remove repeated phone, email, URL, or address values within one card |
| P3 | Fuzzy Contact Matcher | `/tool/fuzzy-contact-matcher` | Find probable duplicates using review-first scoring |
| P3 | Contact Quality Score | `/tool/contact-quality-score` | Report completeness and consistency without pretending to measure truth |

### 9.6 Validation, compatibility, and repair

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | VCF Validator | `/tool/vcf-validator` | Identify syntax, structure, and compatibility problems |
| P0 | VCF Repair | `/tool/vcf-repair` | Apply safe repairs with a change report |
| P0 | vCard Version Converter | `/tool/vcard-version-converter` | Convert between 2.1, 3.0, and 4.0 |
| P1 | VCF Encoding Fixer | `/tool/vcf-encoding-fixer` | Repair UTF-8, legacy charset, and quoted-printable problems where possible |
| P1 | VCF Import Compatibility Check | `/tool/vcf-compatibility-checker` | Test against selected platform profiles |
| P1 | Duplicate Header and Boundary Fixer | part of repair | Correct repeated or missing `BEGIN:VCARD` and `END:VCARD` boundaries |
| P1 | Line Ending Fixer | part of repair | Convert mixed line endings to a selected target |
| P1 | Escaping Fixer | part of repair | Repair malformed commas, semicolons, backslashes, and newlines |
| P1 | Parameter Normaliser | part of repair | Clean common `TYPE`, `PREF`, `ENCODING`, and `CHARSET` issues |
| P2 | vCard 2.1 Compatibility Mode | part of version tool | Handle common legacy encodings and binary continuations |
| P2 | Apple Contacts Compatibility Report | `/platform/apple-contacts-vcf-compatibility` | Tested guidance and report profile |
| P2 | Google Contacts Compatibility Report | `/platform/google-contacts-vcf-compatibility` | Tested guidance and report profile |
| P2 | Outlook Compatibility Report | `/platform/outlook-vcf-compatibility` | Tested guidance and report profile |
| P2 | Android Contacts Compatibility Report | `/platform/android-vcf-compatibility` | Tested guidance and report profile |
| P3 | Repair Unknown Vendor Extensions | not automatic | Preserve and explain unknown fields rather than guessing |

### 9.7 Extraction and transformation

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P1 | Extract Phone Numbers from VCF | `/tool/extract-phone-numbers-from-vcf` | Export phone values with contact names |
| P1 | Extract Emails from VCF | `/tool/extract-emails-from-vcf` | Export email values with contact names |
| P1 | Extract Contact Photos | `/tool/extract-vcf-photos` | Download embedded images with safe filenames |
| P1 | Extract Addresses | `/tool/extract-addresses-from-vcf` | Export structured postal addresses |
| P1 | Extract Companies | `/tool/extract-companies-from-vcf` | Export organisations, departments, and titles |
| P1 | Extract URLs | `/tool/extract-urls-from-vcf` | Export contact URLs without automatically visiting them |
| P2 | Extract Birthdays | `/tool/extract-birthdays-from-vcf` | Export birthday fields carefully |
| P2 | Extract Notes | `/tool/extract-notes-from-vcf` | Export notes as text or CSV |
| P2 | Extract Unknown X-Properties | `/tool/extract-vcard-extensions` | Report vendor-specific fields |
| P2 | Contact Count | `/tool/count-vcf-contacts` | Count cards and useful fields |
| P2 | Field Frequency Report | `/tool/vcf-field-frequency` | Show field usage across the file |
| P2 | Change Phone Type | `/tool/change-vcard-phone-type` | Reclassify CELL, HOME, WORK, VOICE, FAX, and other types |
| P2 | Change Email Type | `/tool/change-vcard-email-type` | Reclassify personal and work email values |
| P2 | Add Country Code to Phone Numbers | `/tool/add-country-code-to-vcf` | Add a chosen country code with review |
| P3 | Remove Country Code | `/tool/remove-country-code-from-vcf` | Remove a specified prefix with warnings |

### 9.8 Create and share

| Priority | Tool | Suggested route | Core job |
|---|---|---|---|
| P0 | vCard Creator | `/tool/vcard-creator` | Create one standards-valid contact card |
| P1 | Bulk vCard Creator | `/tool/bulk-vcard-creator` | Create multiple cards from a table |
| P1 | vCard QR Code Generator | `/tool/vcard-qr-code` | Generate a QR code locally from one contact |
| P1 | VCF to QR Codes | `/tool/vcf-to-qr-codes` | Generate one QR code per contact |
| P1 | Printable Contact Directory | `/tool/print-contact-directory` | Produce a local print layout |
| P2 | Public Business vCard Cleaner | `/tool/public-business-vcard` | Strip private fields before sharing |
| P2 | Email Signature vCard Generator | `/tool/email-signature-vcard` | Create a compact professional vCard |
| P2 | Download One Contact from Multi-VCF | `/tool/download-one-vcf-contact` | Select and export one card |
| P3 | QR Code to vCard | `/tool/qr-code-to-vcard` | Parse a user-selected QR image locally |
| P3 | Camera QR Scanner | `/tool/scan-vcard-qr` | Parse a vCard QR with explicit camera permission |

### 9.9 Platform workflows

These pages should be useful, tested workflows. Some are tool presets rather than separate processors.

| Priority | Page or preset | Suggested route |
|---|---|---|
| P0 | Google Contacts CSV to VCF | `/platform/google-contacts-csv-to-vcf` |
| P0 | Outlook CSV to VCF | `/platform/outlook-csv-to-vcf` |
| P0 | Excel Contacts to Android | `/platform/excel-contacts-to-android` |
| P0 | Excel Contacts to iPhone | `/platform/excel-contacts-to-iphone` |
| P1 | Import VCF into Google Contacts | `/platform/import-vcf-google-contacts` |
| P1 | Import VCF into iCloud | `/platform/import-vcf-icloud` |
| P1 | Import VCF into Outlook | `/platform/import-vcf-outlook` |
| P1 | Import VCF into Android | `/platform/import-vcf-android` |
| P1 | Import VCF into iPhone | `/platform/import-vcf-iphone` |
| P1 | Export Google Contacts to CSV or VCF | `/platform/export-google-contacts` |
| P1 | Export iPhone Contacts | `/platform/export-iphone-contacts` |
| P1 | Export Apple Contacts on Mac | `/platform/export-apple-contacts-mac` |
| P1 | Transfer Contacts Without Google | `/platform/transfer-contacts-without-google` |
| P1 | Transfer Contacts Without iCloud | `/platform/transfer-contacts-without-icloud` |
| P2 | Samsung Contact Export and Import | `/platform/samsung-vcf-contacts` |
| P2 | Nextcloud vCard Compatibility | `/platform/nextcloud-vcard` |
| P2 | Thunderbird vCard Workflow | `/platform/thunderbird-vcard` |
| P2 | CRM CSV to VCF Mapping | `/platform/crm-csv-to-vcf` |
| P2 | Spreadsheet Phone Numbers to WhatsApp Contacts | `/platform/spreadsheet-to-whatsapp-contacts` |

The WhatsApp-related page must remain about creating ordinary phone contacts. It must not enable unsolicited messaging, scraping, or spam automation.

---

## 10. Launch scope

The site should not wait for the entire catalogue. Launch with a coherent set that proves the product.

### 10.1 Minimum viable launch

Required tools:

1. Full vCard Editor
2. VCF Viewer
3. vCard Creator
4. VCF to CSV
5. CSV to VCF
6. VCF to Excel
7. Excel to VCF
8. Merge VCF
9. Split VCF
10. Remove Duplicate Contacts
11. VCF Validator
12. VCF Repair
13. vCard Version Converter
14. Contact Cleaner
15. Extract Phone Numbers
16. Extract Emails

Required non-tool pages:

- Home
- Tools directory
- Guides directory
- About
- Author
- How it works
- Security
- Browser support
- Privacy
- Cookies
- Terms
- Contact
- Changelog
- HTML sitemap

Required guides:

1. What is a VCF file?
2. How to open a VCF file on Windows
3. How to open a VCF file on Mac
4. How to open a VCF file on iPhone
5. How to open a VCF file on Android
6. How to import VCF into Google Contacts
7. How to import VCF into iCloud
8. How to import VCF into Outlook
9. How to convert Excel contacts to VCF
10. Why a VCF file will not import
11. vCard 2.1 vs 3.0 vs 4.0
12. VCF vs CSV for contact backups
13. How to merge many VCF files
14. How to split one VCF into separate contacts
15. How to remove duplicate contacts safely
16. How to fix strange characters in a VCF file

### 10.2 Better launch

A stronger launch adds:

- VCF Encoding Fixer;
- Compare VCF Files;
- Normalise Phone Numbers;
- Remove Contact Photos;
- VCF to JSON;
- JSON to VCF;
- Google Contacts CSV preset;
- Outlook CSV preset;
- downloadable synthetic test files;
- vCard property reference;
- compatibility test matrix.

### 10.3 Launch acceptance rule

Do not launch a page merely because a route exists. A launchable tool page must have:

- a working processor;
- a synthetic sample;
- file validation;
- useful errors;
- progress feedback where needed;
- a preview;
- a safe download;
- unique explanatory content;
- tested metadata;
- internal links;
- accessibility review;
- at least one real fixture test;
- no file-content network transmission.


---

## 11. Flagship vCard Editor specification

The full editor is the product that justifies the domain. It should be more capable than a converter form and more approachable than a developer text editor.

### 11.1 Entry points

The user can begin by:

- selecting one `.vcf` or `.vcard` file;
- selecting several VCF files;
- dragging files into the workspace;
- pasting vCard text;
- opening a synthetic sample;
- creating a blank contact;
- importing CSV or Excel and mapping it into the editor.

Do not use “upload” as the only visible verb when the file is not sent to a server. “Choose file”, “Open file”, or “Select file” is clearer. A small explanation may say:

> The file is opened locally in your browser. It is not uploaded to our application server.

### 11.2 Initial processing

After file selection, the editor should:

1. inspect the extension and content signature;
2. detect byte-order marks;
3. estimate text encoding;
4. identify line endings;
5. detect whether the file contains one or many vCards;
6. identify the apparent vCard version of each card;
7. parse properties and parameters;
8. record malformed lines and recovery decisions;
9. build both a raw abstract syntax tree and an editable canonical model;
10. display a summary before the user changes anything.

Example summary:

```text
1 file opened
2,846 contacts
vCard 3.0: 2,831
vCard 2.1: 15
Warnings: 38
Embedded photos: 411
Unknown vendor fields: 7 types
```

### 11.3 Editor layout

Recommended desktop layout:

- **left panel**: contact list, search, filters, groups;
- **centre panel**: selected contact form;
- **right panel**: validation, raw properties, and change history;
- **top toolbar**: undo, redo, bulk actions, clean, validate, export;
- **bottom or floating status region**: processing progress and current warning count.

Recommended mobile layout:

- contact list screen;
- contact-detail screen;
- validation drawer;
- export screen;
- no attempt to reproduce a three-column desktop layout on a small screen.

### 11.4 Contact list features

The list should support:

- virtualised rendering for large files;
- search by name, phone, email, company, title, UID, or note;
- sort by formatted name, family name, given name, organisation, or file order;
- filter by contact completeness;
- filter by warning type;
- filter by presence or absence of phone, email, photo, address, or organisation;
- filter by vCard version;
- filter by duplicate status;
- multi-select;
- select all visible;
- select all contacts;
- invert selection;
- keyboard navigation;
- clear indication of unsaved changes;
- contact count and selected count;
- an accessible empty state.

### 11.5 Contact form fields

Support at least:

- formatted name;
- structured name components;
- nickname;
- multiple phone numbers with types and preference;
- multiple emails with types and preference;
- organisation;
- department or organisational unit;
- job title;
- role;
- multiple postal addresses;
- website URLs;
- birthday;
- anniversary where represented;
- gender and pronoun fields where supported by the target version and extensions;
- notes;
- categories or groups;
- UID;
- revision timestamp;
- contact photo;
- logo;
- related contacts;
- instant-messaging or social profile fields where present;
- geo and timezone fields where present;
- custom `X-` properties;
- unrecognised properties in a raw-property area.

Each repeatable field needs:

- add;
- remove;
- reorder;
- type selector;
- preference selector;
- validation status;
- a way to preserve unknown parameters.

### 11.6 Raw view

The raw view should:

- display the original or current serialised card;
- syntax-highlight properties, parameters, and values;
- show line numbers;
- mark recovered or invalid lines;
- let advanced users edit raw text in an isolated mode;
- parse changes before applying them to the form;
- never render raw values as HTML;
- provide a clear way to return to the structured form;
- keep a snapshot so the user can revert.

### 11.7 Bulk editing

Bulk actions should include:

- add or replace a field;
- remove a selected field type;
- change phone or email type;
- add a country code;
- normalise whitespace;
- trim names;
- remove photos;
- remove notes;
- remove addresses;
- set or convert vCard version;
- assign categories;
- remove selected contacts;
- export selected contacts only.

Every bulk action must show:

- the number of affected contacts;
- an example before and after;
- fields that will be skipped;
- an undo path.

### 11.8 Undo and redo

The editor must support:

- undo and redo for field edits;
- undo and redo for bulk operations;
- a bounded history to avoid memory exhaustion;
- operation labels such as “Removed 31 empty contacts”;
- a final change summary at export.

For very large documents, store compact patches rather than full-document snapshots.

### 11.9 Export flow

The export modal should let the user choose:

- vCard version 2.1, 3.0, or 4.0;
- one multi-contact file or separate files in a ZIP;
- all contacts or selected contacts;
- original order or current sort order;
- line ending style, with CRLF as the standards-oriented default;
- UTF-8 encoding where supported;
- include or exclude photos;
- preserve unknown fields;
- lossless mode where possible;
- normalised mode;
- filename;
- whether to download a change or compatibility report.

Before export, show:

- errors blocking export;
- warnings that do not block export;
- version-conversion losses;
- repair actions;
- contact and field counts;
- estimated output size.

### 11.10 Change report

Offer a local text, JSON, or CSV report containing:

- source file names if the user explicitly chooses to include them;
- input contact count;
- output contact count;
- contacts removed;
- duplicates merged;
- fields added, changed, or removed;
- malformed lines repaired;
- unknown fields preserved or dropped;
- version conversions;
- photos removed or resized;
- warnings not resolved.

The report should not be sent to analytics or stored remotely.

### 11.11 Recovery and crash resistance

At minimum:

- keep the original `File` reference only while needed;
- warn before closing when unsaved work exists;
- offer optional local recovery using IndexedDB;
- keep local recovery disabled by default until privacy copy is clear;
- if enabled, state exactly that the browser stores the project locally;
- allow the user to clear recovery data;
- expire local drafts automatically after a defined period;
- never sync drafts to the server.

---

## 12. Detailed core tool requirements

### 12.1 VCF Viewer

#### Inputs

- one or more `.vcf` or `.vcard` files;
- pasted vCard text;
- sample data.

#### Outputs

- readable contact cards;
- searchable table;
- raw source view;
- contact count;
- version and warning report;
- optional export of selected fields.

#### Required behaviour

- no editing controls by default;
- clear button to continue in the full editor;
- photos displayed only from embedded safe data after validation;
- external image URLs are not fetched automatically;
- telephone, email, and URL values are displayed as text first;
- clickable actions require deliberate user activation;
- unknown properties are visible in an advanced panel.

### 12.2 vCard Creator

#### Required fields

Only require enough data to produce a valid and useful card. Do not force every field.

#### Features

- live preview;
- version selector;
- multiple phones and emails;
- structured name;
- organisation and title;
- address builder;
- note;
- photo with size warning;
- QR preview;
- download `.vcf`;
- copy raw vCard;
- reset;
- synthetic example.

#### Safety

- escape all values correctly;
- prevent markup injection;
- validate image type and dimensions;
- never fetch a photo URL automatically;
- warn if a selected target version cannot preserve a field.

### 12.3 VCF to CSV

#### User choices

- one row per contact;
- one row per phone or email value;
- wide format with repeated numbered columns;
- long or normalised format;
- select columns;
- include raw or unknown fields;
- delimiter;
- quote policy;
- line endings;
- UTF-8 with optional BOM for spreadsheet compatibility;
- spreadsheet-safe formula handling;
- date format;
- preferred-field policy.

#### Default columns

- Full Name
- First Name
- Middle Name
- Last Name
- Prefix
- Suffix
- Nickname
- Phone 1 Value
- Phone 1 Type
- Phone 2 Value
- Phone 2 Type
- Email 1 Value
- Email 1 Type
- Email 2 Value
- Email 2 Type
- Organisation
- Department
- Title
- Role
- Street
- City
- Region
- Postal Code
- Country
- Birthday
- Website
- Notes
- Categories
- UID
- Source vCard Version

#### CSV injection protection

Spreadsheet programs may interpret cells beginning with characters such as `=`, `+`, `-`, or `@` as formulas. Provide a clearly labelled **Spreadsheet-safe CSV** option. Do not silently alter the data without disclosure. The preview and change report must show when cells are escaped or prefixed.

### 12.4 CSV to VCF

This is one of the most important tools and must be better than a simple header matcher.

#### Input handling

- CSV file;
- TSV file;
- pasted table;
- Excel file routed through the same mapper;
- comma, semicolon, tab, pipe, or auto-detected delimiter;
- UTF-8 and common legacy encodings;
- optional header row;
- large-file streaming where practical.

#### Mapping interface

The mapper should:

- show source columns;
- auto-suggest target fields;
- show confidence;
- allow manual changes;
- support multiple source columns mapped to one logical field;
- support repeated phone and email fields;
- support address component mapping;
- support phone and email type selection;
- allow a default country for phone normalisation;
- allow a default vCard version;
- allow fixed values such as organisation or category;
- preview at least several converted contacts;
- flag rows missing all usable contact fields;
- save mapping presets locally with explicit consent.

#### Header synonym library

Recognise common variants such as:

- First Name, Given Name, GivenName, Forename;
- Last Name, Family Name, Surname;
- Full Name, Name, Display Name;
- Mobile, Mobile Phone, Cell, Cell Phone;
- Phone, Phone Number, Telephone;
- Work Phone, Business Phone;
- Home Phone;
- Email, E-mail, Email Address;
- Work Email, Business Email;
- Company, Organisation, Organization;
- Department;
- Job Title, Title, Position;
- Address, Street, Street Address;
- City, Town;
- State, Region, Province;
- ZIP, Zip Code, Postal Code, Postcode;
- Country;
- Notes, Comment, Description.

Do not auto-map an ambiguous column without showing the user.

#### Output modes

- one VCF containing all contacts;
- one VCF per row in a ZIP;
- version 2.1, 3.0, or 4.0;
- include a rejected-row CSV;
- include a mapping report;
- include validation warnings.

#### Platform presets

Provide tested presets for:

- Google Contacts CSV;
- Outlook CSV;
- generic Excel contact list;
- simple name and phone list;
- CRM export, only after actual fixtures are obtained.

### 12.5 Excel to VCF and VCF to Excel

#### Excel import

- support `.xlsx` first;
- treat `.xls` support as a separate capability and do not promise it until safely implemented;
- select sheet;
- show sheet dimensions;
- detect headers;
- feed data into the CSV-style field mapper;
- preserve displayed values rather than formulas by default;
- warn about hidden sheets and merged cells;
- do not execute macros;
- reject macro-enabled files or treat them as data-only with a clear warning;
- never evaluate formulas.

#### Excel export

- create a clean `.xlsx` workbook locally;
- include one Contacts sheet;
- optional Warnings sheet;
- optional Field Dictionary sheet;
- freeze headers;
- apply filters;
- use readable column widths;
- preserve phone numbers as text to avoid scientific notation or loss of leading zeros;
- preserve long numeric identifiers as text;
- escape or neutralise dangerous formulas;
- avoid excessive styling that increases file size.

### 12.6 Merge VCF

#### Inputs

- multiple VCF files;
- folders only when supported by the browser and explicitly selected;
- drag and drop;
- sample files.

#### Options

- preserve file order;
- sort by contact name;
- standardise output version;
- keep original versions where possible;
- detect exact duplicates;
- run duplicate review before final merge;
- include source-file labels as categories, only when the user chooses;
- remove empty cards;
- preserve unknown fields;
- choose output line endings.

#### Output

- one multi-contact VCF;
- summary by source file;
- optional duplicate report;
- optional compatibility report.

### 12.7 Split VCF

#### Split modes

- one contact per file;
- fixed number of contacts per file;
- split by category;
- split by organisation;
- split by first letter;
- split selected contacts only.

#### File naming

Use safe, deterministic names:

```text
001-alice-johnson.vcf
002-bob-adebayo.vcf
```

Rules:

- remove path separators and control characters;
- avoid collisions by appending a sequence;
- limit length;
- use a fallback such as `contact-0001.vcf`;
- offer UID-based names only when explicitly selected;
- never include private values such as phone numbers by default.

#### Output

- ZIP for multiple files;
- manifest with file name and display name;
- optional chunks rather than thousands of separate files.

### 12.8 Remove Duplicate Contacts

Duplicate handling must be review-first. False merges can be more damaging than duplicate entries.

#### Exact match rules

- same UID;
- same normalised phone number;
- same normalised email address;
- exact canonical card content;
- exact formatted and structured name plus another matching field.

#### Probable match rules

- same normalised name and organisation;
- same name plus partial phone overlap;
- same name plus email similarity;
- same phone with different formatting;
- same email with different letter case or surrounding whitespace;
- multiple matching secondary fields.

#### Matching controls

- exact only;
- conservative;
- balanced;
- broad review mode;
- custom field selection.

#### Review screen

For each duplicate group:

- show all cards side by side;
- highlight equal and differing fields;
- show why the match was suggested;
- let the user keep one card;
- let the user merge fields;
- let the user mark “not duplicates”;
- let the user apply a rule to similar groups;
- provide undo.

#### Merge policies

- prefer most complete;
- prefer latest `REV` where trustworthy;
- prefer first or last source;
- combine unique values;
- preserve conflicting values for manual choice;
- never overwrite silently.

#### Phone normalisation

- remove formatting punctuation for comparison;
- retain original display values;
- use an explicitly chosen country for national numbers;
- do not guess a country from IP address;
- distinguish extensions;
- avoid treating short codes as ordinary full phone numbers.

#### Email normalisation

- trim surrounding whitespace;
- compare domain case-insensitively;
- use conservative full-address matching;
- do not automatically strip plus tags;
- do not assume provider-specific alias rules.

### 12.9 Contact Cleaner

The cleaner should act as a diagnostic dashboard.

Example report:

```text
2,846 contacts analysed
137 probable duplicate groups
42 invalid or incomplete phone values
19 contacts without names
31 contacts without a phone or email
73 repeated field values
16 malformed email values
28 cards with mixed vCard versions
411 embedded photos using 18.4 MB
7 unknown vendor property types
```

Cleaning actions should include:

- trim whitespace;
- remove control characters;
- fix missing formatted names where safe;
- standardise line endings;
- remove exact repeated fields;
- remove empty contacts;
- normalise common type labels;
- repair obvious boundary errors;
- remove photos;
- convert version;
- review duplicates;
- inspect invalid emails;
- inspect phone-number formatting;
- preserve original file and provide undo.

The cleaner should distinguish:

- **safe automatic fixes**;
- **review recommended**;
- **cannot fix reliably**.

### 12.10 VCF Validator

The validator should return structured diagnostics rather than a single pass/fail message.

Diagnostic fields:

- severity: error, warning, information;
- contact index;
- line number where available;
- property;
- rule identifier;
- message;
- suggested action;
- whether safe auto-repair exists;
- source standard or compatibility profile.

Check at least:

- card boundaries;
- missing version;
- unsupported or mixed versions;
- missing required or strongly expected name fields;
- malformed property lines;
- invalid parameter syntax;
- invalid escaping;
- invalid folding;
- encoding declaration problems;
- malformed base64 or quoted-printable data;
- invalid date formats;
- invalid URI forms where required;
- repeated singleton fields;
- empty property names;
- invalid control characters;
- suspiciously large embedded values;
- unknown properties and parameters;
- fields likely to fail in a chosen platform profile.

Do not label unknown vendor properties as errors solely because they are unknown.

### 12.11 VCF Repair

Repair must be transparent.

Safe repair examples:

- normalise line endings;
- remove UTF-8 BOM after decoding;
- unfold lines;
- add missing final newline;
- remove blank lines between cards where harmless;
- normalise property-name case;
- repair obvious missing boundaries when unambiguous;
- escape unescaped line breaks;
- remove illegal control characters;
- normalise common parameter forms;
- generate a missing `FN` from structured name components when the user approves;
- replace malformed but recoverable encoding markers.

Unsafe or ambiguous repairs should require review:

- deciding where one malformed card ends and another begins;
- changing phone numbers;
- guessing name components;
- discarding unknown fields;
- converting corrupted binary photos;
- inferring a country code;
- merging contacts;
- rewriting all custom fields.

Always provide:

- before and after preview;
- change count;
- downloadable repair report;
- original-file preservation.

### 12.12 vCard Version Converter

Supported directions:

- 2.1 → 3.0;
- 2.1 → 4.0;
- 3.0 → 2.1;
- 3.0 → 4.0;
- 4.0 → 2.1;
- 4.0 → 3.0.

Use one strong tool page for the converter. Create separate guides for high-value compatibility cases only when the content is genuinely distinct. Do not create six thin copies of the same tool.

Before conversion, show:

- source version distribution;
- target version;
- fields requiring transformation;
- fields not supported by the target profile;
- unknown extensions;
- expected loss or representation changes;
- encoding changes;
- photo handling;
- telephone representation differences;
- preference and type mapping changes.

Offer:

- strict standards mode;
- compatibility mode based on tested platform fixtures;
- preserve unknown fields where legal;
- sidecar loss report.

### 12.13 Encoding Fixer

Required capabilities:

- detect UTF-8 BOM;
- detect valid UTF-8;
- inspect declared `CHARSET` values in legacy cards;
- decode quoted-printable values;
- handle common Windows encodings when detection confidence is sufficient;
- preview uncertain conversions;
- preserve original bytes until the user confirms;
- show replacement characters and suspicious sequences;
- support common symptoms such as `Ã©` or broken non-Latin names;
- never promise perfect recovery when the original byte information is lost.

### 12.14 Extract Phone Numbers and Emails

Outputs:

- CSV;
- TXT;
- copied text;
- selected contact subset;
- optional deduplicated list.

Include:

- contact display name;
- original value;
- normalised comparison value;
- type;
- preference;
- source contact index;
- warning status.

Do not claim that values are active or deliverable.

---

## 13. vCard standards and interoperability

### 13.1 Standards baseline

The implementation should use these as primary references:

- vCard 4.0: RFC 6350;
- vCard 3.0: RFC 2426, now obsolete but required for real-world compatibility;
- parameter value encoding: RFC 6868;
- xCard: RFC 6351;
- jCard: RFC 7095;
- JSContact: RFC 9553 and current updates;
- vCard extensions for JSContact: RFC 9554;
- JSContact and vCard conversion rules: RFC 9555;
- current JSContact version updates, including RFC 9982 where relevant;
- CardDAV context: RFC 6352, for future interoperability understanding.

vCard 2.1 support is a pragmatic compatibility layer. It predates the modern RFC structure used by 3.0 and 4.0 and appears in many real exports. Support must be fixture-driven and honest about limitations.

### 13.2 Internal representation

Use two related representations:

1. **Lossless syntax tree**
   - original card boundaries;
   - line order;
   - group names;
   - property name casing;
   - raw parameters;
   - raw encoded values;
   - folding positions where practical;
   - unknown properties;
   - parse diagnostics.

2. **Canonical contact model**
   - normalised fields for UI and transformation;
   - repeatable values with types and preferences;
   - structured names and addresses;
   - source metadata;
   - field provenance;
   - version-independent concepts;
   - explicit extension storage.

This dual model allows the editor to offer both:

- a lossless or minimally changed round-trip;
- a clean normalised export.

### 13.3 Parsing pipeline

Recommended pipeline:

```text
File bytes
  → size and type guard
  → encoding/BOM inspection
  → text decoding
  → line-ending normalisation for parser view
  → line unfolding
  → card boundary detection
  → property-line tokenisation
  → parameter parsing
  → value decoding
  → version-aware interpretation
  → lossless AST
  → canonical contact model
  → diagnostics
  → UI
```

### 13.4 Serialisation pipeline

```text
Canonical contact model + retained AST
  → target version/profile
  → field mapping
  → loss analysis
  → value escaping
  → parameter serialisation
  → encoding decisions
  → line folding
  → CRLF output
  → file/ZIP generation
  → download + optional report
```

### 13.5 Required parser behaviours

Handle:

- multiple cards in one file;
- mixed versions;
- folded lines;
- CRLF, LF, and mixed line endings;
- escaped commas, semicolons, backslashes, and newlines;
- structured values such as `N` and `ADR`;
- repeated properties;
- property groups;
- `TYPE` parameters;
- preference semantics;
- language and alternative identifiers;
- URIs in 4.0 fields;
- text telephone values common in older versions;
- quoted-printable legacy fields;
- base64 or binary photo values;
- data URIs;
- external photo URIs without fetching them;
- unknown `X-` fields;
- registered extensions not known at compile time;
- empty values;
- invalid but recoverable lines;
- Unicode and non-Latin names;
- null bytes and control characters;
- very long lines;
- comments or junk outside card boundaries, reported rather than silently swallowed.

### 13.6 Field preservation policy

Default priorities:

1. preserve the user's original information;
2. preserve unknown fields;
3. avoid destructive normalisation;
4. disclose transformations;
5. let the user choose strict compatibility when necessary.

When the target format cannot represent a value:

- preserve it in a supported extension when standards and compatibility allow;
- otherwise include it in the loss report;
- never silently discard it.

### 13.7 Unknown fields

Unknown properties and parameters should be:

- retained in the lossless model;
- visible in the advanced inspector;
- carried through same-version exports when syntactically safe;
- included in compatibility warnings;
- excluded only when the user selects a strict target profile that disallows them;
- never executed, fetched, or rendered as markup.

### 13.8 Platform profiles

A platform profile is a tested set of export preferences, not a guess.

Each profile should specify:

- preferred vCard version;
- encoding expectations;
- supported field types;
- treatment of multiple contacts in one file;
- photo limits observed in testing;
- group/category behaviour;
- known rejected syntax;
- test date;
- application and operating-system version;
- fixture source;
- uncertainty notes.

Do not publish a compatibility claim until a fixture has been imported and exported through the relevant platform or confirmed from current official documentation.

### 13.9 Compatibility test corpus

Maintain synthetic and vendor-derived fixtures, with no real private data.

Required fixture groups:

- clean vCard 2.1;
- clean vCard 3.0;
- clean vCard 4.0;
- multi-card files;
- mixed-version files;
- quoted-printable names;
- non-Latin scripts;
- emoji;
- folded lines;
- long notes;
- embedded JPEG and PNG photos;
- external image URIs;
- missing `FN`;
- malformed boundaries;
- duplicate fields;
- duplicate contacts;
- unknown `X-` properties;
- Google Contacts exports;
- Apple Contacts/iCloud exports;
- Outlook exports;
- Android exports;
- Nextcloud exports if added;
- intentionally hostile values for XSS and CSV-injection tests.

Any vendor-derived fixture committed to the repository must be sanitised and legally usable.

---

## 14. Canonical data model

A possible TypeScript shape follows. The final model may differ, but it must preserve provenance and unknown values.

```ts
export type VCardVersion = "2.1" | "3.0" | "4.0" | "unknown";

export interface ContactDocument {
  id: string;
  sources: SourceFile[];
  cards: ContactCard[];
  diagnostics: Diagnostic[];
  documentStats: DocumentStats;
  dirty: boolean;
}

export interface SourceFile {
  id: string;
  displayName?: string;
  sizeBytes: number;
  detectedEncoding: string;
  encodingConfidence: number;
  lineEnding: "crlf" | "lf" | "cr" | "mixed";
  hash?: string; // local-only, never transmitted
}

export interface ContactCard {
  localId: string;
  sourceId?: string;
  sourceCardIndex: number;
  version: VCardVersion;
  formattedName?: string;
  name?: StructuredName;
  nicknames: string[];
  phones: ContactValue<PhoneValue>[];
  emails: ContactValue<EmailValue>[];
  addresses: ContactValue<PostalAddress>[];
  organizations: OrganizationValue[];
  titles: string[];
  roles: string[];
  urls: ContactValue<string>[];
  notes: string[];
  birthdays: DateLikeValue[];
  anniversaries: DateLikeValue[];
  categories: string[];
  photos: MediaValue[];
  logos: MediaValue[];
  related: ContactValue<string>[];
  timeZones: string[];
  geo: GeoValue[];
  uid?: string;
  revision?: string;
  extensions: UnknownProperty[];
  rawAst: RawCardAst;
  diagnostics: Diagnostic[];
  changeState: ChangeState;
}

export interface ContactValue<T> {
  id: string;
  value: T;
  types: string[];
  preference?: number;
  group?: string;
  language?: string;
  label?: string;
  parameters: Record<string, string[]>;
  sourcePropertyId?: string;
}

export interface Diagnostic {
  id: string;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  cardLocalId?: string;
  sourceLine?: number;
  propertyName?: string;
  standardReference?: string;
  repairability: "automatic" | "review" | "none";
}
```

### 14.1 Model rules

- Every repeatable value has a stable local ID.
- Every editable field can point back to its source property.
- Unknown parameters are retained.
- Empty and missing are distinct.
- Original display values are retained separately from comparison-normalised values.
- Normalised values used for matching are not exported unless the user chooses to apply the change.
- Contact photos are represented with type, source form, byte size, and validation status.
- The UI never relies only on array position as identity.
- IDs generated for local editing are not automatically exported as vCard UIDs.

---

## 15. User experience specification

### 15.1 Standard tool-page layout

Every tool page should follow this order:

1. breadcrumb;
2. H1 matching the actual job;
3. two-sentence explanation;
4. local-processing trust message;
5. interactive tool;
6. concise limitations or compatibility warning;
7. how the tool works;
8. common use cases;
9. input and output example;
10. platform compatibility notes;
11. visible questions and answers;
12. related tools;
13. relevant guides;
14. author and last-tested date where appropriate.

The interactive tool should be visible without scrolling through a long essay.

### 15.2 File selector

Requirements:

- visible label;
- keyboard operable;
- drag and drop as an enhancement, not the only method;
- accepted extensions stated;
- file size shown after selection;
- local-processing statement;
- remove and replace controls;
- sample button;
- clear error messages;
- no automatic processing before the user understands the action when the action is destructive.

### 15.3 Progress

For work lasting more than a brief moment:

- show current stage;
- show progress when measurable;
- show an indeterminate state when not measurable;
- allow cancellation where safe;
- keep the interface responsive;
- use an accessible live region;
- do not fake a percentage.

Example stages:

```text
Reading file
Detecting encoding
Parsing contact 8,421 of 20,000
Checking duplicates
Preparing download
```

### 15.4 Error messages

Good:

> We found 12 lines that do not follow the selected vCard format. Your original file has not been changed. Review the lines or try the repair tool.

Bad:

> Conversion failed.

Error messages should include:

- what happened;
- whether the original file is safe;
- the likely cause;
- what the user can do;
- a link to a relevant tool or guide;
- a stable error code for debugging, without exposing private data.

### 15.5 Preview

Every converter should show:

- a representative input preview;
- output preview;
- row or contact counts;
- warnings;
- omitted fields;
- data-loss indicators;
- a way to change options before download.

Large previews should be virtualised and capped without truncating the actual output.

### 15.6 Download

The real download button must:

- use a consistent style across the site;
- be clearly labelled with the format;
- never sit beside an advertisement that resembles it;
- show the output size if known;
- use a safe generated filename;
- avoid automatic downloads before explicit action;
- provide a second action such as “Start another file” after success.

### 15.7 Samples

Each major tool needs at least one synthetic sample. Useful samples:

- simple five-contact file;
- multilingual file;
- duplicate-contact file;
- malformed file;
- mixed-version file;
- photo-containing file;
- Google-style CSV;
- Outlook-style CSV.

Samples must be clearly fictional. Never use real people's contact details.

### 15.8 Tool chaining

After a tool finishes, offer relevant next steps only.

Examples:

- VCF to CSV → “Clean this CSV in HappyCSV”;
- CSV to VCF → “Validate the new VCF”;
- Merge VCF → “Check for duplicate contacts”;
- Repair VCF → “Open the repaired file in the editor”;
- VCF Viewer → “Edit this file”;
- Remove duplicates → “Export or compare with the original.”

Do not show a wall of unrelated links.

### 15.9 Search and discovery

Provide a client-side tool search that searches:

- tool name;
- format;
- task synonyms;
- platform names;
- common error phrases.

Example synonyms:

- combine → merge;
- separate → split;
- contacts file → VCF or vCard;
- phonebook → contacts;
- spreadsheet contacts → CSV or Excel to VCF;
- clean duplicates → remove duplicate contacts.

---

## 16. Accessibility

Target **WCAG 2.2 AA**.

### 16.1 Required controls

- every input has a programmatic and visible label;
- drag-and-drop areas have a normal file-input alternative;
- buttons have descriptive names;
- focus is visible;
- focus is not hidden behind sticky elements;
- all actions work with a keyboard;
- dialogs trap focus correctly and restore it on close;
- table controls have accessible names;
- progress and results use appropriate live regions;
- validation errors are linked to fields;
- colour is not the only indicator;
- touch targets meet minimum size expectations;
- text supports zoom to 200 percent without loss of function;
- no essential information is available only on hover;
- animations respect reduced-motion preferences;
- charts or summaries have text equivalents;
- the editor provides a non-drag method for reordering repeated fields.

### 16.2 Table accessibility

The virtualised contact table must be tested with screen readers. If a complex ARIA grid becomes unreliable, provide:

- a semantic table mode for smaller datasets;
- a list mode;
- direct contact navigation;
- exportable summaries.

Do not apply ARIA roles mechanically. Native HTML is preferred where it meets the interaction requirement.

### 16.3 Accessibility testing

Run:

- automated axe checks;
- keyboard-only review;
- screen-reader smoke tests with NVDA or VoiceOver;
- contrast checks;
- zoom and reflow checks;
- mobile touch-target checks;
- error-recovery tests;
- large-file progress announcement tests.

Accessibility failures block release for core workflows.

---

## 17. Privacy architecture

### 17.1 Core promise

The core processing tools should not send contact-file contents to the application server.

The site may still make ordinary requests for page assets, analytics, consent management, advertising, error reporting, or fonts. The privacy copy must distinguish these from contact-file processing.

Recommended statement:

> Your selected contact file is processed by code running in your browser. vCard Editor does not send the file contents to its application server. Website services such as consent, analytics, or advertising may still receive ordinary browsing information as described in the Privacy Policy.

### 17.2 Strong privacy boundary

The preferred mature architecture separates the public content shell from the private processor:

```text
vcardeditor.com
  Static SEO pages, guides, consented analytics, and later advertising

app.vcardeditor.com
  Private processing workspace
  No advertising
  No third-party analytics
  No cookies except strictly necessary local preferences, if any
  Strict Content Security Policy
```

Options:

1. link from tool pages to the isolated workspace;
2. embed the workspace in a cross-origin sandboxed iframe;
3. keep the launch version on one origin without ads, then separate before monetisation.

If an iframe is used, the file chooser and processing should live inside the isolated frame. The parent page should receive only non-sensitive status messages such as completion state, never contact values or filenames.

### 17.3 Data minimisation

Do not collect:

- file contents;
- contact names;
- phone numbers;
- email addresses;
- addresses;
- notes;
- embedded photos;
- filenames;
- raw validation messages containing contact values;
- mapping column contents;
- downloaded output;
- local project data.

### 17.4 Local storage

Local storage or IndexedDB may be used for:

- user interface preferences;
- mapping presets;
- recent tool slugs;
- optional local drafts;
- consent state.

Rules:

- disclose each category;
- do not store files or contact data without an explicit opt-in;
- provide “Clear local data”;
- namespace data by version;
- expire drafts;
- never use local contact data for profiling;
- do not sync it.

### 17.5 Analytics privacy

Analytics events may include:

- tool slug;
- workflow step;
- success or failure code;
- duration bucket;
- input size bucket, only if needed and disclosed;
- contact-count bucket, only if needed and disclosed;
- browser and viewport information supplied by the analytics platform.

Analytics must never include:

- filenames;
- contact values;
- raw error lines;
- exported content;
- user-entered mapping names;
- pasted vCard text.

### 17.6 Remote resources

- self-host fonts where practical;
- do not fetch contact photo URLs automatically;
- do not resolve URLs found in notes or fields;
- do not load remote avatars;
- do not preview remote websites;
- do not call phone or email validation APIs with user data;
- do not use remote AI services on contact files;
- prevent analytics libraries from reading user data by keeping data out of attributes and logs.

### 17.7 Memory cleanup

After reset or completion:

- terminate workers;
- revoke object URLs;
- clear array buffers;
- clear temporary model references;
- remove previews from the DOM;
- clear local draft when requested;
- avoid persistent console output;
- allow garbage collection.

JavaScript cannot guarantee immediate physical memory erasure, so privacy language must not claim cryptographic deletion from RAM.

---

## 18. Security

### 18.1 Threat model

Potential threats include:

- maliciously crafted VCF files exploiting parser bugs;
- extremely large files causing browser memory exhaustion;
- large embedded photos or base64 payloads;
- ZIP bombs in generated or imported archives;
- XSS through names, notes, URLs, labels, or custom properties;
- CSV formula injection in exports;
- malicious URLs embedded in contacts;
- browser hangs from quadratic duplicate matching;
- prototype pollution through parsed objects;
- unsafe third-party dependencies;
- supply-chain attacks;
- contact data accidentally included in logs or error reporting;
- deceptive ads near upload or download controls;
- phishing copies of the site;
- insecure preview deployments being indexed;
- future contact-form abuse.

### 18.2 File handling controls

Even though processing is local:

- allowlist expected extensions;
- inspect contents rather than trusting MIME type;
- cap file size according to tested browser capacity;
- cap individual property length;
- cap decoded image size;
- cap card count where necessary;
- warn before opening unusually large files;
- parse incrementally or in a worker;
- support cancellation;
- fail safely;
- never execute embedded content;
- never evaluate formulas;
- never interpret contact notes as HTML;
- never use `eval` for parsing;
- never pass untrusted strings to dynamic code constructors.

### 18.3 XSS prevention

- render contact values with text nodes;
- avoid `dangerouslySetInnerHTML` for user data;
- sanitise any generated HTML export;
- encode attribute values;
- validate URL schemes;
- block `javascript:` and other unsafe schemes;
- display unknown fields as text;
- use a strict CSP;
- avoid inline scripts where possible;
- use Trusted Types if practical;
- include malicious fixtures in tests.

### 18.4 CSV injection

When exporting spreadsheet-compatible formats:

- detect cells beginning with spreadsheet formula triggers;
- provide spreadsheet-safe mode;
- explain transformations;
- test the output in Excel, LibreOffice, and Google Sheets;
- avoid claiming that one escaping strategy is universally perfect;
- preserve a raw-data option for advanced users with a warning.

### 18.5 Image safety

For embedded photos:

- validate declared and detected media type;
- reject SVG as an embedded preview unless safely rasterised;
- decode images with browser-safe APIs;
- set maximum dimensions and decoded bytes;
- do not execute metadata;
- remove malformed images from preview, not necessarily from the file;
- offer a separate “remove photos” action;
- avoid remote image fetching.

### 18.6 Algorithmic denial of service

Duplicate matching and fuzzy comparison can become expensive.

Required mitigations:

- hash exact phones and emails into indexes;
- use blocking keys before fuzzy comparison;
- avoid all-pairs comparison for large files;
- cap fuzzy candidate groups;
- run expensive matching in a worker;
- expose progress and cancellation;
- use time budgets;
- degrade to exact-only mode when the dataset is too large;
- test worst-case adversarial inputs.

### 18.7 Security headers

Recommended production headers, adjusted for the final hosting model:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
frame-ancestors via CSP
```

Do not add headers blindly. Test downloads, workers, sandboxed frames, analytics, consent, and ads under the final CSP.

### 18.8 Dependency security

- use a lockfile;
- pin production dependencies;
- enable Dependabot or Renovate;
- run dependency review in pull requests;
- audit licences;
- avoid abandoned parsing libraries for the core standards engine;
- prefer small, well-maintained dependencies;
- do not load critical libraries from public CDNs at runtime;
- generate a software bill of materials for releases if feasible;
- review high-severity advisories before deployment;
- maintain `THIRD_PARTY_NOTICES.md`.

### 18.9 Error monitoring

If Sentry or another service is used:

- scrub all user values;
- disable DOM recording on private workspaces;
- disable session replay in the editor;
- never attach files;
- avoid breadcrumbs containing field values;
- use stable internal error codes;
- sample conservatively;
- document the provider in the Privacy Policy.

### 18.10 Security documentation

Repository files:

```text
SECURITY.md
THREAT_MODEL.md
PRIVACY_ARCHITECTURE.md
THIRD_PARTY_NOTICES.md
```

Public pages:

- Security;
- How it works;
- Privacy;
- Browser support;
- responsible disclosure contact.

---

## 19. Performance and large-file strategy

### 19.1 Core Web Vitals targets

At the 75th percentile, aim for:

- LCP at or below 2.5 seconds;
- INP at or below 200 milliseconds;
- CLS at or below 0.1.

### 19.2 Page budgets

Recommended initial budgets for ordinary tool pages before ads:

- initial JavaScript under 200 KB compressed where practical;
- route-specific processing code loaded only when needed;
- no large table or spreadsheet library on pages that do not use it;
- self-hosted font subset or system font stack;
- reserved dimensions for every image and advertisement;
- no autoplay media;
- no unnecessary animation library.

### 19.3 Worker architecture

Use Web Workers for:

- parsing medium and large files;
- encoding conversion;
- duplicate indexing and matching;
- file serialisation;
- ZIP creation;
- Excel parsing and generation;
- image resizing;
- statistics.

The UI thread should handle:

- controls;
- small state changes;
- virtualised rendering;
- progress display;
- user decisions.

### 19.4 Streaming

Use streams where browser support and libraries allow:

- incremental text decoding;
- line processing;
- progressive parsing;
- output generation;
- ZIP generation;
- direct writing to a user-selected file in browsers that support it.

Always provide a Blob-based fallback.

### 19.5 Performance targets

These are engineering targets, not public promises. Validate on representative hardware.

| Dataset | Target experience |
|---|---|
| Up to 1 MB or about 2,000 simple contacts | Parse and display summary in about 1 second on a modern desktop |
| Up to 10 MB or about 20,000 simple contacts | Complete parsing within several seconds, with responsive UI and progress |
| 10 to 50 MB | Worker-based processing, progress, cancellation, and no page freeze |
| Photo-heavy files | Warn about decoded memory and offer photo-free processing |
| Very large or unsafe input | Refuse gracefully or switch to reduced functionality |

Do not market a fixed maximum until benchmarks exist. Publish a browser-support and practical-limits page based on measured results.

### 19.6 Memory rules

- avoid duplicating the entire file in several string forms;
- release source buffers after the user chooses not to retain lossless mode;
- store photos as Blob references where possible;
- virtualise lists;
- use compact indexes for duplicate matching;
- cap undo history;
- estimate memory before decoding huge base64 images;
- warn users on mobile devices earlier than on desktop;
- terminate inactive workers.

---

## 20. Recommended technology stack

The stack should favour static delivery, browser-side processing, reuse with HappyCSV, and low operating cost.

### 20.1 Application framework

- **Next.js 16.x App Router**, using the latest stable patch available when implementation begins;
- **React** version supported by that Next.js release;
- **TypeScript** with strict mode;
- static rendering for public pages;
- server rendering only where it creates a clear benefit;
- static export remains an option because the core processor does not need a server.

Do not pin this README to an old patch. The lockfile and release notes should record the actual tested versions.

### 20.2 Styling and components

Recommended:

- Tailwind CSS;
- Radix UI primitives or shadcn/ui components where accessible and useful;
- CSS variables for tokens;
- no heavy general-purpose design system;
- custom data-table styling for contact workflows.

### 20.3 State and forms

Recommended:

- React Hook Form for contact forms;
- Zod for application-level schemas and boundaries;
- Zustand or a small custom store for editor state;
- Immer only if patch generation and undo justify it;
- TanStack Table for table logic;
- TanStack Virtual or equivalent for large lists.

### 20.4 Processing engine

Create a first-party package:

```text
@utility/vcard-engine
```

Responsibilities:

- byte and encoding inspection;
- parser;
- syntax tree;
- canonical model;
- serialiser;
- version conversion;
- validation;
- repair;
- deduplication indexes;
- field mapping;
- change and loss reports.

Avoid making an unmaintained third-party vCard parser the single foundation of the product. Libraries may be used for comparison and fixtures, but the core behaviour must be under project control.

### 20.5 Supporting libraries

Evaluate current maintenance, bundle size, security, and licence before adoption.

Likely needs:

- CSV parser with streaming and worker support;
- XLSX reader/writer with a permissive licence;
- `libphonenumber-js` or equivalent for explicit-region phone parsing;
- a small ZIP library such as `fflate`;
- a QR generation library;
- a safe QR decoding library for later phases;
- character-encoding detection and decoding utilities;
- date parsing limited to defined formats;
- hashing through Web Crypto;
- an image-resize pipeline based on browser APIs.

Never use a dependency merely because it appears in a generated recommendation. Inspect its repository, release history, issues, licence, transitive dependencies, and bundle effect.

### 20.6 Content

Recommended:

- MDX or Markdown stored in the repository;
- validated front matter;
- build-time content index;
- original screenshots stored locally;
- no dependency on a database for launch;
- optional headless CMS only when publishing volume justifies it.

### 20.7 Testing

- Vitest for unit and property tests;
- Testing Library for component tests;
- Playwright for end-to-end tests;
- axe integration for accessibility;
- Lighthouse CI for performance and SEO checks;
- fuzz and golden-file tests for the parser;
- visual regression for critical flows if maintainable.

### 20.8 Tooling

- pnpm workspaces;
- Turborepo if sharing code across HappyCSV and future sites;
- ESLint and Prettier, or Biome if the team standardises on it;
- Changesets for shared-package versioning if packages are published or reused independently;
- GitHub Actions;
- Renovate or Dependabot;
- conventional commits are optional, but release notes must remain understandable.

### 20.9 Hosting

Recommended initial host:

- Vercel, especially if reusing the HappyCSV deployment model;
- Cloudflare may be used for DNS, caching, security, and IndexNow support where appropriate.

The core product should remain portable to static hosting.

### 20.10 No database at launch

The first version should not need a database.

A database becomes relevant only for optional future features such as:

- accounts;
- cloud projects;
- paid entitlements;
- support tickets;
- server-side presets;
- team workspaces.

Adding one early increases privacy, security, and operational burden without improving the core tool.

---

## 21. Monorepo and folder structure

Recommended portfolio-aware structure:

```text
utility-sites/
├─ apps/
│  ├─ happycsv/
│  └─ vcardeditor/
├─ packages/
│  ├─ ui/
│  ├─ tool-shell/
│  ├─ file-runtime/
│  ├─ privacy-boundary/
│  ├─ seo/
│  ├─ analytics/
│  ├─ consent/
│  ├─ ads/
│  ├─ vcard-engine/
│  ├─ csv-engine/
│  ├─ spreadsheet-engine/
│  └─ test-fixtures/
├─ tooling/
│  ├─ eslint-config/
│  ├─ typescript-config/
│  └─ scripts/
└─ docs/
   ├─ portfolio-architecture.md
   └─ shared-security.md
```

Possible `apps/vcardeditor` structure:

```text
apps/vcardeditor/
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx
│  │  ├─ tool/[slug]/page.tsx
│  │  ├─ guide/[slug]/page.tsx
│  │  ├─ format/[slug]/page.tsx
│  │  └─ platform/[slug]/page.tsx
│  ├─ privacy/page.tsx
│  ├─ security/page.tsx
│  ├─ terms/page.tsx
│  ├─ robots.ts
│  ├─ sitemap.ts
│  ├─ manifest.ts
│  └─ opengraph-image.tsx
├─ components/
│  ├─ editor/
│  ├─ tools/
│  ├─ content/
│  ├─ seo/
│  └─ layout/
├─ content/
│  ├─ guides/
│  ├─ formats/
│  └─ platform/
├─ lib/
│  ├─ tools-registry.ts
│  ├─ content-index.ts
│  ├─ metadata.ts
│  ├─ analytics.ts
│  └─ privacy.ts
├─ public/
│  ├─ samples/
│  ├─ screenshots/
│  └─ icons/
├─ tests/
│  ├─ e2e/
│  ├─ accessibility/
│  └─ seo/
└─ README.md
```

### 21.1 Tool registry

Store tool metadata in a typed registry:

```ts
export interface ToolDefinition {
  slug: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  status: "planned" | "beta" | "stable";
  processorId: string;
  relatedTools: string[];
  relatedGuides: string[];
  indexable: boolean;
  sampleIds: string[];
  lastCompatibilityTest?: string;
}
```

This registry should drive:

- navigation;
- tool directory;
- search;
- related tools;
- sitemap inclusion;
- metadata validation;
- status badges;
- analytics slugs;
- build checks.

### 21.2 Shared versus site-specific code

Share:

- file picker;
- worker messaging;
- progress UI;
- download utility;
- privacy notices;
- analytics event types;
- SEO helpers;
- consent integration;
- ad-slot component;
- layout primitives;
- test utilities.

Keep site-specific:

- brand visual identity;
- copy;
- tool taxonomy;
- content;
- vCard engine;
- contact editor;
- compatibility profiles;
- samples;
- domain-specific structured data.

The portfolio should share infrastructure without becoming a visible clone network.

---

## 22. Worker and application architecture

### 22.1 Worker protocol

Use typed messages:

```ts
export type WorkerRequest =
  | { type: "PARSE_VCARD"; jobId: string; payload: ParsePayload }
  | { type: "VALIDATE"; jobId: string; payload: ValidatePayload }
  | { type: "SERIALIZE"; jobId: string; payload: SerializePayload }
  | { type: "DEDUPE"; jobId: string; payload: DedupePayload }
  | { type: "CANCEL"; jobId: string };

export type WorkerResponse =
  | { type: "PROGRESS"; jobId: string; stage: string; current?: number; total?: number }
  | { type: "RESULT"; jobId: string; payload: unknown }
  | { type: "ERROR"; jobId: string; code: string; safeMessage: string }
  | { type: "CANCELLED"; jobId: string };
```

Rules:

- no raw contact values in production logs;
- transferable buffers where beneficial;
- cancellation checks inside long loops;
- worker termination after completion or inactivity;
- schema validation at the worker boundary;
- stable error codes;
- no implicit global mutable job state.

### 22.2 Processor contracts

Each tool processor should implement a common interface:

```ts
export interface LocalToolProcessor<Input, Options, Preview, Output> {
  validateInput(input: Input): Promise<InputValidation>;
  createPreview(input: Input, options: Options): Promise<Preview>;
  run(input: Input, options: Options, signal: AbortSignal): Promise<Output>;
  describeChanges(output: Output): ChangeSummary;
  dispose(): void;
}
```

This makes shared UI possible without coupling every tool to one monolithic component.

### 22.3 Private processor isolation

When the isolated `app.` subdomain is introduced:

- serve only self-hosted scripts and styles;
- no ads;
- no marketing pixels;
- no third-party session replay;
- use a separate CSP;
- prevent framing by unknown origins;
- allow framing only by `vcardeditor.com` if embedding is needed;
- communicate with the parent through a narrow, validated `postMessage` protocol;
- never include file contents in messages;
- verify message origin;
- avoid shared cookies.

---

## 23. SEO strategy

### 23.1 SEO objective

Earn organic traffic by being the best answer for specific contact-file jobs. The SEO strategy is not to create the largest number of URLs. It is to create the strongest set of working pages in a coherent topic.

### 23.2 Search-intent architecture

#### Transactional tool intent

Examples:

- vCard editor;
- VCF editor online;
- VCF to CSV;
- CSV to VCF;
- VCF to Excel;
- merge VCF files;
- split VCF file;
- remove duplicate contacts from VCF;
- vCard version converter;
- VCF repair;
- VCF viewer.

These map to `/tool/` pages.

#### Informational troubleshooting intent

Examples:

- VCF file will not import;
- how to open a VCF file;
- why names are corrupted in VCF;
- unsupported vCard version;
- how to preserve leading plus sign in phone numbers;
- how to convert contacts from Excel to phone.

These map to `/guide/` pages.

#### Platform workflow intent

Examples:

- import VCF into iPhone;
- import VCF into Google Contacts;
- Outlook CSV to VCF;
- Excel contacts to Android;
- export iPhone contacts to CSV.

These map to `/platform/` pages.

#### Reference intent

Examples:

- vCard 3.0 format;
- vCard fields;
- `FN` vs `N` in vCard;
- `TEL` property examples;
- vCard line folding;
- vCard MIME type.

These map to `/format/` pages.

### 23.3 Keyword-to-page map

Do not allow several pages to compete for the same primary intent.

| Primary intent | Canonical page | Secondary terms |
|---|---|---|
| vCard editor | `/tool/vcf-editor` | VCF editor, edit vCard online, edit VCF contacts |
| VCF viewer | `/tool/vcf-viewer` | open VCF online, read vCard file |
| VCF to CSV | `/tool/vcf-to-csv` | vCard to CSV, contacts VCF to Excel-ready CSV |
| CSV to VCF | `/tool/csv-to-vcf` | CSV to vCard, spreadsheet to contacts |
| VCF to Excel | `/tool/vcf-to-excel` | vCard to XLSX, contacts to spreadsheet |
| Excel to VCF | `/tool/excel-to-vcf` | XLSX to vCard, Excel contacts to phone |
| merge VCF | `/tool/merge-vcf` | combine VCF, join vCard files |
| split VCF | `/tool/split-vcf` | separate VCF contacts, VCF to individual files |
| duplicate contacts | `/tool/remove-duplicate-contacts` | VCF duplicate remover, dedupe vCard |
| vCard versions | `/tool/vcard-version-converter` | VCF 2.1 to 3.0, vCard 4.0 to 3.0 |
| VCF repair | `/tool/vcf-repair` | fix corrupt VCF, repair vCard |
| VCF validation | `/tool/vcf-validator` | check vCard, validate VCF |

### 23.4 On-page template

Each indexable tool page needs:

- unique title;
- unique meta description;
- one clear H1;
- two-sentence task explanation;
- working tool;
- example input and output;
- limitations;
- compatibility notes;
- visible questions and answers;
- relevant related links;
- self-referencing canonical;
- breadcrumb;
- updated date where meaningful;
- original screenshots or diagrams if they help.

### 23.5 Title patterns

Examples:

```text
Edit VCF Files Online | Free vCard Editor
VCF to CSV Converter | Private, Browser-Based Tool
CSV to VCF Converter | Map Excel Contacts to vCard
Merge VCF Files Online | Combine vCard Contacts
Remove Duplicate Contacts from VCF | Review Before Merging
```

Do not force the brand into every title if it makes the title unreadable. Keep the most important task near the beginning.

### 23.6 Meta descriptions

Write a page-specific pitch. Example:

> Open a VCF file, edit contact fields, review validation warnings, and export vCard 2.1, 3.0, or 4.0. Processing stays in your browser.

Google may generate a different snippet. The description should still accurately summarise the page.

### 23.7 Headings

- one H1;
- logical H2 and H3 hierarchy;
- headings describe sections rather than repeat keywords;
- no hidden keyword blocks;
- no dozens of tiny FAQ headings added only for search engines.

### 23.8 URL rules

- lowercase;
- hyphen-separated;
- stable;
- no dates in evergreen URLs;
- no format parameters creating indexable duplicates;
- no query-string pages in the sitemap;
- redirect old slugs permanently;
- avoid unnecessary nesting.

### 23.9 Canonicalisation

- every indexable page has a self-referencing canonical;
- preview, print, share, and parameter variants canonicalise to the main page or use `noindex`;
- alternate file inputs do not create separate indexable URLs;
- UTM parameters are not canonical;
- HTTP and `www` variants redirect;
- duplicate HappyCSV content is avoided rather than “fixed” only with canonicals.

### 23.10 Robots

`robots.txt` should:

- allow public pages and assets needed for rendering;
- reference the sitemap;
- block crawl of internal preview paths where appropriate;
- not be used as the method for removing pages from the index;
- avoid blocking JavaScript or CSS needed for search rendering.

Use `noindex` for:

- preview deployments;
- internal test routes;
- user-specific local workspace URLs;
- thin generated result pages;
- temporary experiments;
- print-only duplicates;
- error pages.

### 23.11 Sitemaps

Generate:

- main sitemap index if the site grows;
- tools sitemap;
- guides sitemap;
- formats sitemap;
- platform sitemap;
- static pages sitemap.

Only include:

- canonical;
- indexable;
- successful 200-response pages;
- pages with substantive content.

Do not set fake modification dates. Use the actual content or compatibility-test update date.

### 23.12 Structured data

Use JSON-LD only where it matches visible content.

Recommended:

- `WebSite` on the homepage;
- `Organization` or appropriate publisher entity;
- `SoftwareApplication` or `WebApplication` on genuine tool pages;
- `BreadcrumbList` on nested pages;
- `Article` on substantive guides.

For free tools, a `SoftwareApplication` entry may include an offer with price `0` only when the page genuinely represents the app and the markup meets current Google guidelines.

Do not add unsupported or misleading ratings, reviews, download counts, or pricing.

### 23.13 Site name

Use consistent visible branding and `WebSite` structured data:

- name: `vCard Editor`;
- alternate name: `VCF Editor` only if appropriate;
- URL: `https://vcardeditor.com`.

### 23.14 Internal linking

Use contextual links:

- converter pages link to validation and repair;
- guides link to the exact tool that solves the problem;
- tools link to tested platform guides;
- format references link to tools that use the property;
- related tools are limited to genuinely useful next steps;
- breadcrumbs are crawlable links;
- the tool directory links to every important tool.

Anchor text should describe the destination. Avoid repeated “click here”.

### 23.15 HappyCSV cross-linking

Add these tools to HappyCSV where technically sensible:

- CSV to VCF;
- VCF to CSV.

Differentiate them:

- HappyCSV page: spreadsheet and CSV workflow, columns, delimiter, cleaning, and next CSV steps;
- vCardEditor page: contact semantics, vCard versions, platform compatibility, duplicate handling, and contact-field mapping.

Use contextual cross-links:

- HappyCSV → vCard Editor when the user needs advanced contact editing or compatibility;
- vCard Editor → HappyCSV when the user wants to continue cleaning the generated CSV.

Do not copy full page content. Do not place sitewide keyword-rich footer links across the entire portfolio.

### 23.16 Google Search Console

Immediately after launch:

- verify the domain property;
- submit the sitemap;
- inspect key URLs;
- monitor indexing;
- review queries and pages;
- watch Core Web Vitals;
- monitor manual actions and security issues;
- export data monthly;
- annotate major releases in the internal dashboard.

### 23.17 Bing Webmaster Tools and IndexNow

HappyCSV's early Bing performance makes Bing a first-class channel.

At launch:

- verify the site in Bing Webmaster Tools;
- submit the sitemap;
- configure IndexNow;
- notify IndexNow only when URLs are added, materially updated, moved, or removed;
- monitor Bing queries and page rankings;
- compare Bing and Google intent differences;
- do not spam unchanged URLs.

### 23.18 Core Web Vitals and search

SEO pages should be largely server-rendered or statically rendered. Processing code can hydrate on demand.

- avoid rendering essential explanatory content only after client JavaScript;
- lazy-load heavy editor code;
- reserve ad dimensions;
- use responsive images;
- prevent layout shift when validation panels open;
- break up long tasks;
- test field data, not only laboratory scores.

### 23.19 Exact-match domain expectations

The domain communicates the task, but do not:

- repeat “vCard editor” unnaturally;
- create thin pages because the root is descriptive;
- expect instant ranking;
- over-optimise anchor text;
- use the domain as proof of authority.

Authority must come from useful tools, standards accuracy, original testing, and relevant references.

### 23.20 Programmatic SEO guardrails

Do not generate pages such as:

```text
/vcf-to-csv-for-iphone
/vcf-to-csv-for-android
/vcf-to-csv-for-windows
/vcf-to-csv-for-mac
```

unless each page has a genuinely distinct workflow and tested content.

Before creating a page, answer:

1. Is the user job distinct?
2. Does the page provide unique functionality, evidence, or instructions?
3. Would a user be disappointed if it were merged into another page?
4. Can the page be maintained?
5. Does the page have a clear canonical intent?

If the answers are weak, add a section to an existing page instead.

### 23.21 AI-search visibility

Do not chase separate “GEO” tricks. Make content easy to understand and cite:

- concise answer near the top;
- clear headings;
- standards references;
- tested steps;
- examples;
- visible limitations;
- current dates;
- original compatibility evidence;
- crawlable text;
- strong internal linking.

### 23.22 Link acquisition

Earn links with assets that deserve them:

- open vCard compatibility matrix;
- vCard property reference;
- public synthetic test corpus;
- standards-aware parser documentation;
- “why this VCF will not import” diagnostic report;
- visual version comparison;
- sample files for developers;
- transparent browser privacy test;
- useful answers in relevant forums without spam;
- outreach to migration guides and technical documentation authors.

Do not buy links or mass-submit spun guest posts.

---

## 24. Content strategy

### 24.1 Content purpose

Content should do one of four things:

1. help a user complete a workflow;
2. explain an error;
3. document a format or compatibility issue;
4. lead naturally into a working tool.

Content should not exist merely to make the site look large.

### 24.2 Content pillars

1. Opening and viewing VCF files
2. Converting contact files
3. Phone and platform migration
4. Merging and splitting
5. Duplicate contacts and cleaning
6. Repair and encoding problems
7. vCard versions and standards
8. Privacy and safe contact sharing
9. Bulk business contact workflows
10. Developer reference

### 24.3 Launch article backlog

#### Opening and viewing

- What Is a VCF File and What Does It Contain?
- How to Open a VCF File on Windows
- How to Open a VCF File on Mac
- How to Open a VCF File on iPhone
- How to Open a VCF File on Android
- How to View a VCF File Without Importing Every Contact
- How to See How Many Contacts Are in a VCF File
- How to Open a Multi-Contact VCF File
- Can a VCF File Contain More Than One Contact?

#### Conversion

- How to Convert VCF to CSV Without Losing Phone Numbers
- How to Convert CSV to VCF with Correct Field Mapping
- How to Convert Excel Contacts to VCF
- How to Convert VCF Contacts to Excel
- VCF vs CSV: Which Is Better for Contact Backups?
- How to Convert a Name and Phone List into Phone Contacts
- How to Keep Leading Zeros in Phone Numbers When Using Excel
- How to Preserve the Plus Sign in International Phone Numbers
- How to Convert Google Contacts CSV to VCF
- How to Convert Outlook CSV to VCF
- How to Convert VCF to JSON for Development
- How to Convert vCard to JSContact

#### Migration and platforms

- How to Import a VCF File into Google Contacts
- How to Import a VCF File into iCloud
- How to Import a VCF File into Outlook
- How to Import a VCF File into Android Contacts
- How to Import a VCF File into iPhone Contacts
- How to Export Google Contacts as CSV or vCard
- How to Export Contacts from iPhone
- How to Export Contacts from Apple Contacts on Mac
- How to Transfer Contacts from Excel to Android
- How to Transfer Contacts from Excel to iPhone
- How to Move Contacts Without Using Google Sync
- How to Move Contacts Without Using iCloud
- How to Prepare Spreadsheet Contacts for WhatsApp, Without Bulk Messaging
- How to Transfer Contacts Between Two Phones with a VCF File
- Why Some Apps Import Only the First Contact in a VCF File

#### Merge, split, and organise

- How to Merge Multiple VCF Files into One
- How to Merge Hundreds of Individual vCard Files
- How to Split One VCF into Separate Contact Files
- How to Split a Large VCF into Smaller Files
- How to Sort Contacts Inside a VCF File
- How to Extract One Contact from a Multi-Contact VCF
- How to Compare Two VCF Contact Backups
- How to Create One VCF File per Contact
- How to Group VCF Contacts by Company

#### Duplicate contacts and cleaning

- How to Remove Duplicate Contacts from a VCF File Safely
- Duplicate Contact vs Shared Phone Number: How to Avoid a Bad Merge
- How to Merge Duplicate Contact Records Without Losing Fields
- How to Find Contacts with the Same Phone Number
- How to Find Contacts with the Same Email Address
- How to Remove Empty Contacts from a VCF File
- How to Remove Contacts Without Phone Numbers
- How to Remove Contact Photos from a VCF File
- How to Clean Phone-Number Formatting Before Import
- How to Strip Private Notes and Addresses Before Sharing a vCard

#### Repair and troubleshooting

- Why a VCF File Will Not Import
- How to Repair a Corrupt VCF File
- How to Fix Strange Characters in Contact Names
- How to Fix a VCF File with Missing BEGIN:VCARD or END:VCARD Lines
- How to Fix a Missing FN Field in vCard
- How to Fix Mixed vCard Versions in One File
- How to Fix Quoted-Printable Names in Old VCF Files
- How to Fix an Oversized VCF File
- Why Embedded Contact Photos Make a VCF File Huge
- How to Validate a VCF File Before Importing It
- Why an App Says the vCard Version Is Unsupported
- How to Fix Duplicate Phone and Email Fields Inside One Contact

#### Standards and reference

- vCard 2.1 vs 3.0 vs 4.0
- vCard 4.0 Field Reference
- What FN Means in a vCard
- What N Means in a vCard
- FN vs N: Why vCard Has Two Name Fields
- How TEL Works in vCard 3.0 and 4.0
- How EMAIL Types Work in vCard
- How ADR Stores a Postal Address
- How vCard Line Folding Works
- How Commas, Semicolons, and Newlines Are Escaped in vCard
- What X-Properties Mean in a VCF File
- What the UID Field Does in vCard
- What MIME Type Should a VCF File Use?
- What Is JSContact and How Is It Different from vCard?
- What Are jCard and xCard?

#### Privacy and security

- Are Online VCF Converters Safe?
- What Browser-Based File Processing Means
- How to Check Whether a File Tool Uploads Your Contacts
- How to Remove Private Contact Fields Before Sharing
- How to Create a Public Business vCard from a Personal Contact
- Why vCard Editor Does Not Fetch Contact Photo URLs Automatically
- How Spreadsheet Formula Injection Can Affect Contact CSV Exports

### 24.4 Content brief template

Every article brief should include:

```text
Primary user question
Primary page intent
Target tool
What the user is trying to accomplish
Platforms tested
Fixtures used
Current official sources
Unique value beyond the current search results
Screenshots required
Steps
Failure cases
Limitations
Related tools
Related guides
Last tested date
Update trigger
```

### 24.5 Writing rules

- answer the user's question early;
- use original test results;
- cite standards and official platform documentation;
- explain differences between versions;
- state when a step may vary by app version;
- avoid filler introductions;
- do not invent search volume or usage numbers;
- do not claim “best” without a defined comparison;
- use screenshots created by the project;
- redact all personal details in screenshots;
- include a tested date;
- update platform guides after significant UI changes;
- no mass publication of lightly rewritten AI text.

### 24.6 Article structure

Recommended:

1. direct answer;
2. what is needed;
3. steps;
4. what to do if it fails;
5. data-loss or compatibility notes;
6. tool CTA;
7. questions and answers;
8. source and test notes.

### 24.7 Format reference pages

Reference pages should include:

- definition;
- standards status;
- syntax example;
- field table;
- version differences;
- escaping rules;
- compatibility notes;
- validator link;
- sample download;
- references;
- last reviewed date.

These pages can become linkable technical resources and should receive more care than ordinary blog posts.

### 24.8 Content maintenance

Create an update queue triggered by:

- platform UI changes;
- new standards or RFC updates;
- Search Console queries exposing missing explanations;
- recurring support errors;
- parser changes;
- browser compatibility changes;
- broken screenshots;
- privacy or advertising-policy changes.

---

## 25. Structured page examples

### 25.1 Homepage metadata

```text
Title: vCard Editor | Edit, Convert and Clean VCF Contact Files
Description: Open VCF files, edit contacts, remove duplicates, convert CSV or Excel, repair vCards, and export a compatible file. Processing stays in your browser.
```

### 25.2 VCF editor page

```text
URL: /tool/vcf-editor
H1: Edit VCF Files Online
Title: Edit VCF Files Online | Free vCard Editor
Description: Open a VCF file, edit contact details in bulk, review validation warnings, and export vCard 2.1, 3.0, or 4.0 locally in your browser.
```

### 25.3 CSV to VCF page

```text
URL: /tool/csv-to-vcf
H1: Convert CSV Contacts to VCF
Title: CSV to VCF Converter | Map Contacts to vCard
Description: Map CSV or spreadsheet columns to names, phones, emails, addresses, and organisations, then download one VCF or separate vCards. Local browser processing.
```

### 25.4 Merge page

```text
URL: /tool/merge-vcf
H1: Merge VCF Files
Title: Merge VCF Files Online | Combine vCard Contacts
Description: Combine multiple VCF files into one contact file, review duplicates, choose a vCard version, and download the result without server-side file processing.
```

### 25.5 Repair guide

```text
URL: /guide/vcf-file-wont-import
H1: Why Your VCF File Will Not Import
Title: VCF File Will Not Import? Common Causes and Fixes
Description: Check vCard version, malformed lines, encoding, missing name fields, oversized photos, and multi-contact compatibility, then repair the file safely.
```

---

## 26. Original research and defensible assets

The site should build assets competitors cannot copy cheaply.

### 26.1 Compatibility laboratory

Maintain a documented matrix:

| Platform | Version tested | Import format | Export format | Multi-contact support | Photos | Groups | Notes |
|---|---|---|---|---|---|---|---|

Only publish results from actual tests or current official documentation.

### 26.2 Public test corpus

Consider publishing a small open-source repository with:

- standards-valid samples;
- intentionally malformed samples;
- Unicode cases;
- line-folding cases;
- version-conversion cases;
- expected diagnostics;
- expected normalised output;
- no real personal data.

This can earn developer links and improve product quality.

### 26.3 vCard field reference

Create a searchable reference that shows:

- property name;
- versions;
- value type;
- whether repeatable;
- common parameters;
- example;
- conversion notes;
- platform caveats;
- standards source.

### 26.4 Diagnostic signatures

Build a library of common real-world error signatures:

- missing `END:VCARD`;
- unescaped newline in `NOTE`;
- malformed quoted-printable;
- `TYPE=PREF` differences;
- wrong `CHARSET` declaration;
- mixed encodings;
- invalid photo block;
- unsupported 4.0 URI form;
- missing formatted name;
- duplicate card boundaries.

Each signature should link to an explanation and safe repair path.

---

## 27. Analytics and measurement

### 27.1 Systems

Use:

- Google Search Console;
- Bing Webmaster Tools;
- privacy-appropriate web analytics;
- Vercel Analytics if it meets the project's privacy needs;
- optional server logs with short retention and IP handling documented;
- AdSense reporting after monetisation;
- an internal release annotation log.

### 27.2 Event taxonomy

Recommended events:

```text
page_view
site_search
sample_loaded
file_selected
parse_started
parse_succeeded
parse_failed
preview_generated
tool_run_started
tool_run_succeeded
tool_run_failed
validation_opened
repair_applied
duplicate_review_started
duplicate_decision_completed
export_options_opened
download_clicked
related_tool_clicked
happycsv_referral_clicked
consent_updated
```

### 27.3 Event properties

Allowed examples:

- tool slug;
- input format;
- output format;
- source version category;
- target version;
- size bucket;
- contact-count bucket;
- duration bucket;
- success or safe error code;
- sample versus user file;
- device class.

Forbidden:

- contact fields;
- filenames;
- raw values;
- raw VCF lines;
- user notes;
- mapping labels typed by users;
- email addresses;
- phone numbers;
- downloaded file content.

### 27.4 Product metrics

- tool start rate;
- parse success rate;
- completion rate;
- download rate;
- time to first preview;
- error rate by safe code;
- repair acceptance rate;
- duplicate review completion;
- repeat usage;
- cross-tool continuation;
- HappyCSV referrals in both directions;
- browser failure rate;
- large-file abandonment.

### 27.5 SEO metrics

- organic clicks;
- impressions;
- click-through rate;
- average position;
- indexed canonical pages;
- pages with zero impressions;
- non-branded query share;
- top tool pages;
- top guide pages;
- rankings by search engine;
- queries at positions 8 to 30;
- crawl and indexing errors;
- Core Web Vitals by template.

### 27.6 Business metrics

- page views eligible for ads;
- ad impressions;
- viewability;
- revenue per thousand page views;
- revenue by country and page type;
- consent rate;
- policy warnings;
- accidental-click indicators;
- revenue impact on performance;
- revenue impact on completion rate.

### 27.7 Review cadence

Weekly after launch:

- errors;
- indexing;
- top queries;
- Core Web Vitals;
- security alerts.

Monthly:

- content wins and losses;
- pages at positions 8 to 30;
- tool completion;
- new tool candidates;
- portfolio cross-referrals;
- content updates.

Quarterly:

- expand, maintain, or pause decisions;
- monetisation impact;
- compatibility retesting;
- dependency and security review;
- privacy-policy review;
- roadmap reset.

---

## 28. Monetisation

### 28.1 Principles

- usefulness comes before ads;
- do not apply pressure to download unrelated software;
- no misleading buttons;
- no ad next to the file picker, destructive confirmation, or download button;
- reserve ad dimensions to prevent layout shift;
- consent requirements are part of implementation;
- the private processing workspace should remain free of third-party ads in the mature architecture;
- revenue estimates are uncertain and depend heavily on traffic geography, page type, advertiser demand, and viewability.

### 28.2 Monetisation stages

#### Stage 0: product validation

- no ads;
- establish indexing;
- fix errors;
- publish legal and trust pages;
- build useful content;
- measure performance.

#### Stage 1: content-page advertising

- enable ads on substantive guides and references;
- one restrained placement near or after the introduction;
- one in-content placement on long pages;
- one near the end;
- no ad on sparse pages;
- no ad that pushes the main answer below the fold.

#### Stage 2: tool-page advertising

Only after policy and UX review:

- consider one ad below the tool result or explanatory section;
- keep the action area ad-free;
- do not use sticky ads that cover controls;
- test completion and accidental-click signals;
- remove placements that damage trust.

#### Stage 3: optional additional revenue

- one-time paid desktop version;
- offline batch folder processing;
- donation or support link;
- clearly disclosed affiliate links to relevant contact-management products;
- sponsored content only if labelled and genuinely useful;
- private team deployment.

### 28.3 AdSense readiness

Before enabling AdSense:

- original content exists;
- site navigation is complete;
- Privacy, Cookies, Terms, About, and Contact pages are live;
- no placeholder pages are indexable;
- no copyright-infringing content;
- consent management is implemented;
- ads.txt is configured if required;
- publisher policies are reviewed;
- ad placements are tested on mobile and desktop;
- no ad resembles the real download control;
- analytics and ads do not receive file data;
- the site has a clear author or operator identity;
- invalid traffic monitoring is in place.

### 28.4 Consent

For users in the EEA, UK, and Switzerland, Google requires a certified consent management platform integrated with the relevant Transparency and Consent Framework for applicable publisher advertising. Requirements can change, so recheck current Google policy before launch.

Implementation rules:

- do not load non-essential tracking before consent where consent is required;
- offer a clear reject or manage option;
- record consent state;
- make choices reversible;
- keep the Privacy and Cookie pages current;
- use Google's CMP or another current certified CMP if AdSense is used;
- test consent flows by region;
- do not assume that “non-personalised” always removes the need for consent.

### 28.5 Ad placement rules

Never place ads:

- inside the editor table;
- between field labels and inputs;
- beside “Choose file”;
- beside “Repair”, “Delete”, “Merge”, or “Download”;
- in a dialog where accidental clicks are likely;
- under a heading such as “Download”, “Tools”, or “Helpful links” unless clearly separated and labelled according to policy;
- on error pages;
- on privacy or security pages;
- in the isolated app workspace.

---

## 29. Legal and policy pages

This section is a product checklist, not legal advice. Obtain legal review when the business and data flows justify it.

### 29.1 Privacy Policy

Cover:

- operator identity and contact details;
- local file processing;
- what the server does and does not receive;
- analytics;
- advertising;
- consent management;
- cookies and local storage;
- server logs;
- error monitoring;
- contact-form data;
- retention;
- third-party providers;
- international transfers where relevant;
- user rights;
- children;
- policy updates;
- security limitations.

### 29.2 Cookie Policy

List:

- strictly necessary storage;
- consent storage;
- analytics cookies or storage;
- advertising cookies or identifiers;
- local preferences;
- optional local drafts;
- how to change choices.

### 29.3 Terms of Use

Include:

- service provided as-is;
- user responsibility to keep backups;
- user must have authority to process the contact data;
- no guarantee that every platform will import every field;
- no use for unlawful scraping, spam, harassment, or unauthorised contact processing;
- limitation of liability subject to applicable law;
- intellectual-property terms;
- acceptable use;
- availability and changes;
- governing-law choice after legal advice;
- contact information.

### 29.4 Platform trademark notice

State that references to Apple, iPhone, iCloud, Google, Android, Microsoft, Outlook, WhatsApp, and other products are for compatibility guidance. The site is not affiliated with or endorsed by those companies unless a real partnership exists.

### 29.5 Security page

Explain:

- browser-based processing;
- no application-server file upload;
- third-party scripts and their boundaries;
- CSP and dependency review in plain language;
- responsible disclosure route;
- known limitations;
- last security review date.

### 29.6 How it works page

Provide a simple data-flow diagram and a reproducible way to inspect network activity in browser developer tools. Do not ask users to trust an unsupported claim.

---

## 30. Testing strategy

### 30.1 Unit tests

Test:

- tokenizer;
- line unfolding;
- parameter parser;
- escape and unescape logic;
- structured names;
- addresses;
- version-specific phone handling;
- quoted-printable;
- base64;
- Unicode;
- line folding;
- serialisation;
- loss reports;
- duplicate indexes;
- mapping synonyms;
- safe filenames;
- CSV injection safeguards;
- diagnostics.

### 30.2 Golden-file tests

For each fixture:

- parse to expected model;
- serialise to expected normalised output;
- round-trip in lossless mode;
- compare diagnostics;
- test each target version;
- confirm unknown-field handling.

### 30.3 Property and fuzz testing

Generate:

- random valid properties;
- repeated fields;
- unusual parameter ordering;
- long values;
- mixed Unicode;
- malformed separators;
- random line folding;
- invalid base64;
- invalid quoted-printable;
- nested or repeated boundaries;
- control characters;
- huge duplicate candidate groups.

Assertions:

- no crash;
- no infinite loop;
- bounded memory where possible;
- safe error;
- parser does not execute content;
- serialised valid model reparses.

### 30.4 End-to-end tests

Required flows:

- open sample;
- choose file;
- edit contact;
- undo;
- validate;
- export;
- VCF to CSV;
- CSV mapping to VCF;
- merge files;
- split file;
- duplicate review;
- repair malformed fixture;
- version conversion;
- cancel large job;
- clear local data;
- consent accept, reject, and change;
- ad-free private workspace.

### 30.5 Browser matrix

Support and test current stable versions of:

- Chrome;
- Edge;
- Firefox;
- Safari on macOS;
- Safari on iOS;
- Chrome on Android.

Test at least the latest two major versions where practical. Publish the actual support policy.

### 30.6 Platform compatibility tests

Maintain a manual checklist for:

- Google Contacts import and export;
- iCloud import and export;
- Apple Contacts on Mac;
- Android Contacts;
- Outlook desktop or web where supported;
- Nextcloud if documented;
- Thunderbird if documented.

Record:

- date;
- platform version;
- input fixture;
- result;
- fields preserved;
- fields changed;
- screenshots;
- known issues.

### 30.7 Security tests

- XSS payloads in every text field;
- unsafe URL schemes;
- malformed images;
- huge base64 values;
- null bytes;
- prototype keys such as `__proto__`;
- CSV-formula payloads;
- mixed encodings;
- oversized files;
- cancellation;
- worker error boundaries;
- CSP in report-only then enforcement;
- dependency audit;
- preview deployment indexing;
- network inspection proving no file-content transmission.

### 30.8 SEO tests

Build or CI checks for:

- one H1;
- title present and unique;
- meta description present;
- canonical present;
- indexability status;
- sitemap inclusion;
- robots directives;
- structured-data validity;
- breadcrumbs;
- crawlable internal links;
- 200 status;
- no orphan launch page;
- no placeholder text;
- no duplicate slug;
- no accidental `noindex` in production;
- preview domains set to `noindex`.

### 30.9 Accessibility tests

- automated axe;
- keyboard flows;
- focus management;
- visible focus;
- screen-reader labels;
- error announcement;
- progress announcement;
- colour contrast;
- reduced motion;
- zoom and reflow;
- drag alternative;
- touch target size.

### 30.10 Performance tests

Benchmark:

- parse time;
- serialisation time;
- worker startup;
- memory;
- first preview;
- duplicate matching;
- photo extraction;
- ZIP generation;
- Excel conversion;
- editor scrolling;
- INP during work;
- mobile limits.

Store benchmark fixtures and compare releases.

---

## 31. CI/CD and release management

### 31.1 Pull-request checks

Required:

```text
Type check
Lint
Unit tests
Golden fixtures
Selected fuzz tests
Component tests
Build
SEO validation
Accessibility smoke tests
Dependency review
Licence check
```

### 31.2 Main-branch deployment

- preview deployment for every pull request;
- preview deployments are not indexable;
- production only from protected main branch;
- required review for parser and privacy changes;
- smoke tests after deployment;
- rollback path;
- release annotation.

### 31.3 Versioning

Use semantic versioning for shared packages.

Public site changelog categories:

- new tools;
- compatibility improvements;
- parser changes;
- privacy changes;
- fixes;
- known issues.

Do not expose internal vulnerability details before a fix is available.

### 31.4 Feature flags

Use build-time or privacy-safe flags for:

- beta tools;
- ads;
- analytics provider;
- isolated workspace;
- local draft storage;
- experimental platform profiles.

No flag should send contact data to a remote service.

---

## 32. Environment variables

Example:

```text
NEXT_PUBLIC_SITE_URL=https://vcardeditor.com
NEXT_PUBLIC_APP_URL=https://app.vcardeditor.com
NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_ADS_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_SENTRY_ENABLED=false
SENTRY_DSN=
INDEXNOW_KEY=
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

Rules:

- no secret needed by browser code is truly secret;
- do not place private API credentials in `NEXT_PUBLIC_*`;
- local processing must not depend on a server token;
- development defaults keep ads and analytics disabled;
- production configuration is documented;
- preview deployments use separate settings and `noindex`.

---

## 33. Deployment checklist

### 33.1 Domain and DNS

- register domain;
- enable registrar account MFA;
- lock domain;
- use reliable DNS;
- configure apex and `www` redirect;
- issue HTTPS certificate;
- set renewal reminders;
- configure contact email;
- configure SPF, DKIM, and DMARC if sending domain email.

### 33.2 Search setup

- Google Search Console domain verification;
- Bing Webmaster Tools verification;
- sitemap submitted to both;
- IndexNow key and deployment hook;
- robots checked;
- canonical host checked;
- live URL inspection;
- structured data tested;
- favicon and site name checked.

### 33.3 Privacy and policy

- privacy page final;
- cookies page final;
- terms final;
- security page final;
- consent flow tested by region;
- analytics disclosure correct;
- contact form disclosure correct;
- local processing verified;
- third-party data flows documented.

### 33.4 Product

- all launch tools pass acceptance criteria;
- samples contain no real data;
- browser matrix complete;
- large-file behaviour tested;
- error pages useful;
- downloads use safe filenames;
- all reset actions clear state;
- mobile workflows usable;
- no console leakage;
- no hidden server upload.

### 33.5 SEO and content

- unique titles and descriptions;
- one H1 per page;
- canonical tags;
- breadcrumbs;
- internal links;
- author and update details;
- original screenshots;
- platform guides tested;
- no empty category pages;
- no orphan pages;
- HTML sitemap;
- Open Graph images;
- social preview tested.

### 33.6 Operations

- uptime monitoring;
- error alerting;
- backup of repository and content;
- dependency automation;
- release rollback;
- incident contact;
- changelog;
- monthly analytics export.

---

## 34. Roadmap

### Phase 0: foundation

- secure the domain;
- create repository and monorepo decision;
- define brand tokens;
- set canonical host;
- create static shell;
- add legal and trust-page drafts;
- establish parser fixtures;
- create threat model;
- configure CI.

### Phase 1: standards engine

- byte and encoding handling;
- vCard 3.0 and 4.0 parser;
- pragmatic 2.1 parser;
- lossless AST;
- canonical model;
- serialiser;
- validation;
- diagnostics;
- worker protocol;
- golden tests.

Exit criterion: fixtures parse and re-export predictably, malformed files fail safely, and no contact values leave the browser.

### Phase 2: flagship editor

- contact list;
- contact form;
- raw view;
- validation panel;
- bulk actions;
- undo and redo;
- export flow;
- change report;
- responsive layout;
- accessibility.

Exit criterion: a user can open, edit, validate, and export a multi-contact file reliably.

### Phase 3: launch tool set

- viewer;
- creator;
- VCF to CSV;
- CSV to VCF;
- VCF to Excel;
- Excel to VCF;
- merge;
- split;
- duplicates;
- cleaner;
- validator;
- repair;
- version converter;
- extraction tools.

### Phase 4: content and search launch

- homepage;
- tool pages;
- launch guides;
- format references;
- Search Console;
- Bing Webmaster Tools;
- IndexNow;
- sitemap;
- structured data;
- HappyCSV cross-link tools.

### Phase 5: compatibility moat

- Google fixtures;
- Apple/iCloud fixtures;
- Outlook fixtures;
- Android fixtures;
- public compatibility matrix;
- public test corpus;
- encoding fixer;
- compare tool;
- phone normalisation.

### Phase 6: monetisation

- legal review;
- certified CMP;
- AdSense application;
- content-page ads first;
- performance review;
- policy monitoring;
- tool-page ad test only if safe.

### Phase 7: expansion

Choose based on actual query and product data:

- JSContact;
- jCard/xCard;
- LDIF;
- QR workflows;
- photo tools;
- advanced dedupe;
- platform presets;
- offline PWA;
- desktop product.

---

## 35. Prioritisation framework

Score new tools from 1 to 5 on:

| Factor | Weight |
|---|---:|
| Clear search and user intent | 25% |
| Current result weakness | 15% |
| Fit with site authority | 15% |
| Ability to solve locally | 15% |
| Implementation effort | 10% |
| Unique value beyond competitors | 10% |
| Content and internal-link opportunities | 5% |
| Monetisation fit | 5% |

Do not rely only on estimated keyword volume. HappyCSV already shows that a focused page can outperform the homepage without a huge broad keyword.

### 35.1 Build signals

Invest when:

- users repeatedly search the task;
- existing pages gain impressions at positions 8 to 30;
- support errors indicate a missing tool;
- one converter reveals demand for a broader workflow;
- the tool can be meaningfully better than current results;
- the processor can be reused across multiple pages without creating duplicates.

### 35.2 Pause signals

Pause or merge when:

- the intended page duplicates another page;
- the tool has no meaningful workflow beyond a format rename;
- compatibility cannot be tested;
- the tool would require server upload without a strong reason;
- the page attracts irrelevant genomics VCF intent;
- the site cannot maintain current platform instructions;
- the tool harms privacy or ad-policy compliance.

---

## 36. Portfolio integration

### 36.1 Shared infrastructure goal

vCardEditor.com should become the second mature implementation of a reusable utility-site platform.

Shared portfolio capabilities:

- static tool pages;
- tool registry;
- browser file picker;
- Web Worker jobs;
- progress UI;
- preview framework;
- download framework;
- SEO metadata;
- sitemaps;
- IndexNow;
- legal-page framework;
- consent;
- ads;
- analytics;
- changelog;
- browser support;
- common security headers;
- deployment workflow.

### 36.2 Avoiding a clone network

Each site must have:

- distinct brand;
- distinct navigation;
- domain-specific tools;
- original copy;
- original examples;
- its own compatibility research;
- its own visual details;
- contextual cross-links only.

### 36.3 HappyCSV test-laboratory role

HappyCSV can test adjacent demand through:

- CSV to VCF;
- VCF to CSV;
- contact-list CSV cleaning;
- phone-number extraction;
- duplicate rows by phone or email.

vCardEditor.com should own:

- vCard semantics;
- versions;
- contact editing;
- merge and split;
- duplicate-contact review;
- platform compatibility;
- repair;
- contact privacy.

### 36.4 Cross-site analytics

Track only referral events and landing pages. Do not attempt to transfer files across origins automatically. A user may download from one site and choose the file on the other.

---

## 37. Things the site must never do

- send a selected contact file to a server while claiming local processing;
- log contact values;
- fetch remote photo URLs without consent;
- render notes as HTML;
- auto-merge fuzzy duplicates without review;
- silently drop unsupported fields;
- silently alter phone numbers;
- infer a phone country from IP address and apply it without confirmation;
- claim email or phone validity beyond syntax and formatting;
- promise compatibility without testing;
- call every malformed file “corrupt”;
- place ads next to download buttons;
- create fake download buttons;
- create hundreds of thin pages;
- publish generated articles without factual review;
- use real contact data in samples, screenshots, logs, or tests;
- allow preview deployments into search indexes;
- depend on one abandoned parser library;
- execute macros, formulas, scripts, or embedded content;
- treat `VCF` as unambiguously contact-related without contextual wording;
- imply endorsement by platform companies;
- use manipulative backlink schemes;
- make “unlimited” claims unsupported by browser reality;
- require registration for basic tools;
- block the result behind an email-capture wall;
- delete the original file or overwrite it;
- hide loss or repair reports.

---

## 38. Definition of done for a tool

A tool is “stable” only when all applicable boxes are complete:

### Function

- [ ] Input is validated by content, not extension alone.
- [ ] Sample input works.
- [ ] Preview works.
- [ ] Output is correct against fixtures.
- [ ] Errors are actionable.
- [ ] Cancellation works for long jobs.
- [ ] Download has a safe filename.
- [ ] Original input remains unchanged.
- [ ] Change or loss report exists where relevant.

### Privacy and security

- [ ] No file contents leave the browser.
- [ ] No filename or contact value enters analytics.
- [ ] XSS fixtures pass.
- [ ] Oversized input fails safely.
- [ ] Unsafe URLs are not executed or fetched.
- [ ] CSV formula risks are handled where relevant.
- [ ] Object URLs and workers are cleaned up.

### Accessibility

- [ ] Keyboard flow works.
- [ ] Labels are present.
- [ ] Focus is managed.
- [ ] Progress is announced.
- [ ] Errors are associated with controls.
- [ ] Drag-and-drop has an alternative.
- [ ] Automated accessibility test passes.

### Performance

- [ ] Heavy code is route-loaded.
- [ ] Medium fixture runs in a worker.
- [ ] UI remains responsive.
- [ ] No significant layout shift.
- [ ] Memory is released after reset.

### SEO and content

- [ ] Page intent is unique.
- [ ] Title and description are unique.
- [ ] H1 is correct.
- [ ] Canonical is correct.
- [ ] Page is in the right sitemap.
- [ ] Structured data is accurate.
- [ ] Tool is linked from the directory.
- [ ] Supporting copy is original.
- [ ] Related links are relevant.
- [ ] Last-tested date is recorded if compatibility is discussed.

### Operations

- [ ] Unit tests pass.
- [ ] Golden fixtures pass.
- [ ] End-to-end flow passes.
- [ ] Browser smoke tests pass.
- [ ] Changelog updated.
- [ ] Monitoring recognises safe error codes.

---

## 39. Launch-day checklist

- [ ] Domain is locked and MFA enabled.
- [ ] HTTPS and redirects work.
- [ ] Canonical host is apex domain.
- [ ] Production has no `noindex`.
- [ ] Previews have `noindex`.
- [ ] Sitemap returns 200 and contains only valid pages.
- [ ] Robots file is correct.
- [ ] Google Search Console verified.
- [ ] Bing Webmaster Tools verified.
- [ ] IndexNow works.
- [ ] Homepage tool works.
- [ ] Every launch tool has a sample.
- [ ] Privacy claims verified in browser network tools.
- [ ] Legal pages live.
- [ ] Security page live.
- [ ] Contact route works.
- [ ] Mobile test complete.
- [ ] Safari test complete.
- [ ] Large-file warning works.
- [ ] Downloads work in all supported browsers.
- [ ] No private data in source maps or logs.
- [ ] Error alerting configured.
- [ ] Uptime monitoring configured.
- [ ] Changelog has initial release.
- [ ] HappyCSV cross-links are contextual and live.
- [ ] No ads until the planned monetisation stage.

---

## 40. First 90 days after launch

### Days 1 to 7

- inspect all important URLs;
- fix indexing or rendering errors;
- review real parser failures;
- confirm no file data appears in network requests;
- resolve browser-specific download issues;
- monitor uptime and errors;
- gather early search queries from Bing and Google.

### Days 8 to 30

- improve pages already receiving impressions;
- create guides only for real query gaps;
- publish compatibility matrix version 1;
- add one or two tools based on observed demand;
- improve titles with low click-through rates without chasing clicks dishonestly;
- collect anonymous safe error-code frequencies;
- benchmark large real-world synthetic files.

### Days 31 to 60

- add VCF encoding fixer;
- add compare tool;
- expand platform presets;
- release public fixture samples;
- improve pages ranking between positions 8 and 30;
- begin relevant outreach;
- review whether the editor or converters drive more repeat use.

### Days 61 to 90

- decide whether traffic and content quality justify an AdSense application;
- keep the private workspace ad-free;
- retest Core Web Vitals with any consent or ad scripts;
- expand the winning query cluster;
- pause weak or duplicative pages;
- decide whether JSContact or platform migration is the next growth branch;
- document lessons for site three in the portfolio.

---

## 41. Success criteria

### Product success

- users can complete core workflows without account creation;
- parse and export errors are low and understandable;
- no verified leakage of contact-file contents;
- users review destructive changes;
- compatibility improves over time;
- the editor is useful beyond conversion.

### Search success

- important tool pages are indexed;
- non-branded impressions grow;
- multiple pages receive organic clicks;
- the site is not dependent on the homepage alone;
- Bing and Google both expose actionable query data;
- pages at positions 8 to 30 are systematically improved;
- reference assets earn natural links.

### Business success

- infrastructure remains inexpensive;
- advertising does not reduce completion or trust materially;
- the site contributes meaningful portfolio traffic;
- revenue is diversified by page and geography;
- the project produces reusable infrastructure for future sites;
- optional premium ideas are based on demand rather than speculation.

---

## 42. Official research foundation

The design should be rechecked against current versions of these sources during implementation.

### vCard and contact standards

- [RFC 6350: vCard Format Specification](https://www.rfc-editor.org/info/rfc6350/)
- [RFC 2426: vCard MIME Directory Profile, vCard 3.0](https://www.rfc-editor.org/info/rfc2426/)
- [RFC 6351: xCard, the XML Representation of vCard](https://www.rfc-editor.org/rfc/rfc6351.html)
- [RFC 6868: Parameter Value Encoding in iCalendar and vCard](https://www.rfc-editor.org/rfc/rfc6868.html)
- [RFC 9553: JSContact](https://www.rfc-editor.org/info/rfc9553/)
- [RFC 9554: vCard Extensions for JSContact](https://www.rfc-editor.org/info/rfc9554/)
- [RFC 9555: Converting Between JSContact and vCard](https://www.rfc-editor.org/info/rfc9555/)
- [RFC 9982: JSContact Version 2.0 update](https://www.rfc-editor.org/info/rfc9982/)
- [RFC 6352: CardDAV](https://www.rfc-editor.org/info/rfc6352/)

### Current platform documentation

- [Google Contacts: import CSV or vCard](https://support.google.com/contacts/answer/15147365)
- [Google Contacts: export or back up contacts](https://support.google.com/contacts/answer/7199294)
- [Apple iCloud: import and export vCards](https://support.apple.com/guide/icloud/mmfba748b2/icloud)
- [Apple Contacts on Mac: import contacts](https://support.apple.com/guide/contacts/import-contacts-adrbk1457/mac)
- [Apple Contacts on Mac: export contacts](https://support.apple.com/guide/contacts/adrbdcfd32e6/mac)
- [Apple: troubleshooting vCard import compatibility](https://support.apple.com/guide/contacts/adrbk1526/mac)

### Search and performance

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search Essentials](https://developers.google.com/search/docs/essentials)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google guidance on helpful, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google ranking systems and exact-match domains](https://developers.google.com/search/docs/appearance/ranking-systems-guide)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link)
- [Google snippet and meta-description guidance](https://developers.google.com/search/docs/appearance/snippet)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Google Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [IndexNow documentation](https://www.indexnow.org/)

### Engineering and security

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [Next.js sitemap metadata convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js static export guidance](https://nextjs.org/docs/app/guides/static-exports)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [OWASP HTTP Security Response Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
- [MDN Web Workers API](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
- [MDN Streams API](https://developer.mozilla.org/docs/Web/API/Streams_API)
- [MDN File System API](https://developer.mozilla.org/docs/Web/API/File_System_API)

### Accessibility

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C form labelling guidance](https://www.w3.org/WAI/tutorials/forms/labels/)
- [W3C accessibility evaluation checks](https://www.w3.org/WAI/test-evaluate/easy-checks/)

### Advertising, consent, and privacy

- [Google AdSense Program policies](https://support.google.com/adsense/answer/48182)
- [Google AdSense ad placement policies](https://support.google.com/adsense/answer/1346295)
- [Google publisher privacy disclosures](https://support.google.com/adsense/answer/10502938)
- [Google CMP requirements for the EEA and UK](https://support.google.com/adsense/answer/13554020)
- [Google CMP overview](https://support.google.com/adsense/answer/16918505)
- [ICO guidance on cookies and similar technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
- [EU General Data Protection Regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)

---

## 43. Final product decision

vCardEditor.com should launch as a **real contact-file application with an SEO layer**, not as an SEO site with shallow tools attached.

The order of importance is:

1. standards-aware engine;
2. excellent editor;
3. privacy boundary;
4. high-intent converters and repair tools;
5. tested compatibility content;
6. search distribution;
7. advertising.

When a trade-off is required, preserve correctness, privacy, and user trust before page count or short-term ad inventory.

The simplest statement of the project is:

> **Build the place people trust when a VCF file needs to be opened, edited, converted, cleaned, or repaired.**

