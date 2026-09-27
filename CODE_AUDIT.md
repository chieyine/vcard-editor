# Code audit — 2026-09-27

## Implementation update — 2026-09-27

All 18 findings now have code changes recorded in [IMPLEMENTATION_AUDIT.md](./IMPLEMENTATION_AUDIT.md). That document is the current status, with supported-format boundaries and explicit verification limits. The assessment, findings and 188-file ledger below are preserved as the **pre-implementation audit baseline**: “open” and “next change” describe the audited version, not the current implementation. Removed route wrappers are consolidated in `app/tool/[slug]/page.tsx`; deleted helper/build scripts were replaced by the registry dispatcher and supported tooling.

No agents or tests were used for implementation. Runtime and deployment recommendations remain unverified; static checks cannot replace them.

## Baseline assessment

The platform is a browser-local contact-file workbench built with Next.js and React. Its strongest decision is the local-processing architecture: users choose files, transform them in browser memory, and download a copy. There is no contact-storage backend or account system to maintain. The main paths are an editor, tabular conversion, cleanup/duplicate review, merge/split, and several specialist exports.

The product is broader than its core model can reliably support. The catalogue advertises 96 canonical tools and two legacy aliases, but many routes share one large mode-driven component. A small, dependable core is more valuable than more routes. **It is not currently reasonable to describe the implementation as lossless, code-complete, or comprehensively interoperable.**

The highest priority is preservation of contact data, followed by correct formats and predictable recovery. Styling changes alone would not address those problems. Keep the existing restrained visual direction and browser-local architecture.

## Scope and evidence

- **File review is complete for all 188 project files present at closure**, including hidden configuration, untracked scratch scripts and the generated artifacts listed below. Dependency installations (`node_modules/`), compiled output (`.next/`) and Git internals (`.git/`) are excluded. They are not additional first-party application source.
- Manually reviewed every first-party application route, component, library, configuration and script listed below, including the full tool/content registries. Read existing test definitions and synthetic fixtures as source only. Read all supporting documents, including all 4,710 lines and 43 sections of the master roadmap.
- Reviewed binary fonts through their metadata, character maps and comparison with the installed upstream assets. Reviewed every lockfile package record and dependency relationship structurally. Decoded and inspected the generated report's complete embedded result payload. These methods are detailed below; bundled vendor implementations were not audited line by line.
- No subagents, tests, test additions, browser sessions, builds, deployments, or external address-book imports were used. This is a static code audit, not runtime certification, an advisory scan or a legal review.
- Existing untracked `test-analytics.mjs`, `test-analytics-next.mjs`, and `test-results/` were read and left unchanged. No commits were created. The baseline completion pass updated audit documentation only. The later implementation is recorded above.
- Consulted the installed Next.js CSP/server-client guides and primary format specifications. Findings below are source-traced unless explicitly described as a runtime risk.
- Static validation after the earlier focused code changes: TypeScript check passed; repository lint passed (107 TypeScript files, two text-pattern rules); service-worker JavaScript syntax check passed; patch whitespace check passed. The documentation completion pass checks ledger coverage and patch whitespace. These checks do not prove browser behavior.

### Completion evidence

| Remaining review | Result |
| --- | --- |
| Master roadmap | Read in full and compared with the implementation. Its essential requirements support field preservation, honest previews, explicit conversion loss and simple recovery. Its large optional catalogue, proposed monorepo, extra libraries, monetization and operational plans are not a mandate to expand the product. |
| Lockfile | Inspected all 182 records (root plus 181 packages) and resolved all 259 declared dependency, optional-dependency and peer relationships against their version ranges. No unresolved or incompatible relationship found in the recorded graph. Root dependencies match the manifest; non-root records have registry URLs, versions and integrity metadata. This does not establish absence of vulnerabilities or validate downloaded package contents. |
| Font assets | Parsed all ten WOFF2 files: valid Noto Sans regular/bold metadata, matching the corresponding installed upstream files byte for byte. Character maps confirm that the extended subsets do not contain their entire base alphabets; A08 records the effect on PDF font selection. No PDF was rendered. |
| Tool routes | Cross-checked all 98 registry entries: 96 canonical tools and two aliases. All canonical tools have a route. The 26 fixed route wrappers and 73 dynamic mapping entries contain an overlapping photo-extraction definition; A13 records the metadata/dispatch mismatch. Route coverage does not establish correct behavior. |
| Historical browser report | Decoded the report's sole embedded ZIP member, `report.json`: zero tests, no projects or test files, and `Timed out waiting 120000ms from config.webServer`. Its `stats.ok: true` is not a successful run. The saved last-run file also says `failed`. Neither artifact is evidence of a current pass or a newly reproduced failure. |
| Scratch scripts and compiler cache | Read both analytics rendering scripts; they are server-render smoke snippets, not evidence of browser analytics collection. Inspected the TypeScript cache metadata (compiler 5.9.3, 1,141 input records); this is disposable incremental-build state, not validation evidence. |

At baseline closure the audit had **18 open findings** below. The roadmap's unimplemented optional features are not automatically recommendations to build them. External service ownership, legal assertions, production configuration and address-book compatibility need real operational evidence; reading every repository file cannot establish those facts.

## Baseline findings, in priority order

### A01 · P1 · Ordinary vCard exports can discard data

**Evidence:** `lib/vcard.ts`, `createContact`, `Contact`, and `serializeVCard`.

The parser projects recognized properties into a small model and retains only unrecognized properties in `contact.properties`. The serializer rebuilds the recognized fields. For example, `N:Doe;Jane;Alex;Dr.;Jr.` becomes a model containing Jane/Doe and is exported as `N:Doe;Jane;;;`. Multiple addresses/websites, additional organization components, group associations, PREF/LABEL and other parameters are not fully retained. Keeping unknown fields does not solve this.

This affects editing, sorting, reversing, merging, splitting, repairing, photo removal, version conversion and many downloads even when the user did not intend to change those fields. The selected-contact viewer download now uses decoded original property lines, but that is not byte-for-byte preservation and does not fix the general serializer.

**Next change:** retain an ordered property representation with groups, parameters, structured components and repeated values; project it into simple form fields; patch only properties the user changes. Preserve original blocks for operations that only reorder/select cards. Produce explicit loss information for conversions. This needs deliberate core work, not isolated UI patches.

### A02 · P1 · Developer-format exports do not match their named standards

**Evidence:** `lib/standards.ts`, the jCard, xCard and JSContact reader/writer pairs.

jCard structured N values are emitted as semicolon strings and the reader takes only the first item of standard arrays. Its parameter helper also constructs type-tagged arrays instead of actual parameter values. [RFC 7095](https://www.rfc-editor.org/rfc/rfc7095.html#section-3.3.1.3).

xCard uses the namespace `urn:ietf:params:xml:ns:vcard` and emits N as a text node; the specification uses `urn:ietf:params:xml:ns:vcard-4.0` and structured name children. The regex reader is tailored to the application's own representation. [RFC 6351](https://www.rfc-editor.org/rfc/rfc6351.html#section-4).

JSContact omits mandatory `version`, uses `fullName` instead of `name.full`, and uses incompatible phone/title/note representations. Reading an export produced by the same code can conceal these failures. [RFC 9553](https://www.rfc-editor.org/rfc/rfc9553.html#section-2).

**Next change:** correct a documented subset against independent standard examples, report unsupported fields, and show limits in the UI. Do not market these beta converters as production-compatible until that work is done. LDIF additionally needs proper DN value escaping and clearer loss reporting.

### A03 · P1 · Phone cleanup can change the meaning of numbers

**Evidence:** `lib/contact-tools.ts`, `normalizePhone`, country-code transforms and duplicate comparison.

Removing non-digits folds extensions into the main number, including `tel:...;ext=...`. Applying a country code strips a leading zero without a destination-specific numbering rule. Invalid values can normalize to the same empty string and then be deduplicated. The email-normalization route currently calls the general repeated-field remover, which can also change phone/category data.

**Next change:** preserve original strings, model extensions separately, constrain cleanup to its selected field, and preview every changed number. Avoid claiming region-aware validation from a free-text country code.

### A04 · P1 · QR camera and image lifecycle is incomplete

**Evidence:** `components/qr-code-reader-workspace.tsx`, `startCamera`, `detect`, `handleFile`.

A pending camera-permission request can resolve after Stop/unmount and still retain a stream. Repeated starts can race; play/detection failures do not consistently stop tracks or recover. A failed new image leaves the previous decoded payload available to download. There is no image byte/pixel bound.

**Next change:** one cancellable operation token, track cleanup on every exit, reject late permission results, clear old results when a new image starts, and limit decoded dimensions before canvas work.

### A05 · P1 · “Compare backups” can miss changed contact data

**Evidence:** `components/vcf-compare-workspace.tsx`, `keyFor` and Set-based comparison.

Only UID, name, phones and emails participate. A changed note, address, organization or photo can yield zero added/removed contacts. Duplicate multiplicity is erased by sets, and identity changes appear only as added/removed entries.

**Next change:** match records with a stated identity rule, compare full property values separately, and report added, removed, changed and ambiguous records. Until then label the tool as a limited identity-list comparison.

### A06 · P1 · “Strip private fields” leaves unknown private properties

**Evidence:** `redactContacts` in `lib/contact-tools.ts`, its workspace export options, and sharing guidance in `lib/content-registry.ts`.

Selected known fields are cleared, but unknown vendor properties are exported with `preserveUnknown: true`. A private X-property survives. The checkboxes now behave as selected, but the result is not a verified public-safe card.

**Next change:** make the retained-field set explicit for a shareable-card flow, include unknown properties in review, and explain exactly what is removed. Do not silently discard extensions in normal editing.

### A07 · P2 · Spreadsheet parsing is a limited subset with display-value loss

**Evidence:** `lib/xlsx.ts`, `resolveSheet`, `attribute`, `readXlsx`; `components/conversion-workspace.tsx`.

Duplicate headers and the most obvious archive/grid resource risks were fixed. Remaining issues: the first sheet is selected without honoring hidden status or offering a chooser; the regex XML reader assumes particular quoting/tag shapes; styles are ignored, so date serials and custom formats that display leading zeros are not preserved as displayed. Multiple source columns mapped to the same scalar target overwrite each other. The preview is source rows, not a complete mapped-contact preview.

**Next change:** state the supported subset, preserve text phone values, report formatting loss, provide a sheet choice where promised, reject ambiguous scalar mapping, and render the actual output model before download. Additional code limits do not certify hostile archive handling.

### A08 · P2 · PDF output can overflow and lose glyphs

**Evidence:** `lib/pdf.ts`, `ensureSpace`, `wrap`, `supports`; `components/pdf-workspace.tsx`.

A contact taller than a page is moved to a new page once and still overflows. Long unbroken values and names do not wrap. A successful encode operation is not proof the selected subset contains the glyph; splitting by character can also interfere with complex-script shaping. There is no cancellable generation path.

The completed asset review confirms a concrete coverage gap: none of the ten bundled fonts contains basic Latin `A`, Cyrillic `Ж`, or Greek `Ω`. The Latin-extended files contain `Ā`, the Devanagari files contain `अ`, and the Vietnamese files contain `ệ`; an extended subset is not its base alphabet. The PDF chooser tries `encodeText` to determine support, but the installed custom-font encoder accepts missing-glyph IDs without throwing. It can therefore select the first subset instead of reaching a usable fallback.

**Next change:** paginate detail lines within a contact, wrap names/long words, use character-map coverage for selection, bundle the needed base subsets and retain shaping across text runs. Allow cancellation. The HTML preview is not a preview of the generated PDF pages.

### A09 · P2 · Compatibility profiles are labels, not distinct checks

**Evidence:** `components/vcf-compatibility-workspace.tsx`.

All profiles run the same validation. Changing the selector leaves the old report, and byte-decoder encoding is discarded before the report is built. A basic syntax summary should not look like destination-specific verification.

**Next change:** simplify to an honest syntax report until explicit, evidence-backed destination rules exist; bind the report to the selected input/profile and retain the decoder result.

### A10 · P2 · Production CSP is fragile and needs deployment evidence

**Evidence:** `next.config.ts`, `scripts/csp-hashes.mjs`.

One site-wide header receives the union of every prerendered inline-script hash. Its size grows with the whole catalogue; header limits and runtime error/not-found HTML are not covered by the design. The script mutates Next's private routes manifest after build. SRI for external assets does not authorize inline bootstrapping; the misleading SRI comment was corrected.

**Next change:** select a supported CSP strategy for the actual deployment model, validate ordinary and error responses on that host, and measure header size. No claim is made that a production failure was reproduced during this audit.

### A11 · P2 · Resource budgets and async state vary between tools

**Evidence:** conversion, photo, PDF, fuzzy, standards, SQLite and text workspaces.

Only the flagship editor consistently uses a worker and now invalidates stale jobs. Other readers can finish after reset/new selection. Several paste paths have no byte bound, most processing runs on the main thread, image pixel allocation is unbounded, and some rendered lists grow with the whole file. File-byte limits do not bound parsed object count or decoded work. SQLite recognizes its direct schema from incomplete table checks and the fallback silently truncates at 100,000 rows.

The editor's 15-second worker timeout also retries the same parse synchronously on the main thread. A slow input can therefore defeat the responsiveness benefit of the worker. Reported worker percentages are fixed stage markers, not measured completion.

**Next change:** a small shared import lifecycle with explicit idle/reading/ready/error states and operation cancellation, plus processor-specific budgets and truncation notices. Fail recoverably on a processing timeout; reserve synchronous fallback for a bounded small input. Describe actual stages instead of artificial percentages. Reuse proven pieces without introducing a general plugin/job framework.

### A12 · P2 · Important editor feedback still reflects import-time state

**Evidence:** `components/vcard-editor.tsx`.

Undo recovery, selection restoration, dirty-state baseline and raw/form staleness were fixed. Remaining issues: warnings and version summaries largely describe the original import; every keystroke retains another whole contacts-array snapshot; custom formatted names are overwritten when first/last name changes; internal app navigation is not covered by `beforeunload`; raw-draft edits are not represented in dirty state. Virtual-list keyboard traversal and scroll behavior still need runtime review.

**Next change:** validate the edited contact, use intentional history transactions, preserve customized display names, and make pending drafts/navigation behavior explicit.

### A13 · P2 · Too many advertised flows lack distinct behavior or useful preview

**Evidence:** `app/tool/[slug]/page.tsx`, workspace modes, registries and supporting content.

The table-viewer route renders the regular card viewer. Several reports only appear after download. Cleanup previews show a count rather than changed fields. A link from merge to duplicate review starts a fresh workspace without carrying the file. Fuzzy/PDF tools have inconsistent reopen controls, and catalogue labels are duplicated across several mappings.

The dynamic route defines `extract-vcf-photos` twice: contact-tool metadata describes exporting photo values, while the selected photo workspace exports image files in a ZIP. Static parameter generation includes both definitions, metadata chooses the contact definition, and workspace dispatch chooses the photo definition. All catalogue routes are present; this is a consistency problem within existing routes.

**Next change:** four primary entry points—Edit, Convert, Clean, Organize—with advanced tools discoverable underneath. Use one registry for route, title, input/output and workspace selection; keep operation logic in small pure functions. Preserve useful existing URLs as shortcuts.

### A14 · P2 · Privacy and operational claims need tighter boundaries

**Evidence:** root analytics mounting, `lib/analytics.ts`, privacy/security documentation, content registry, browser configuration and support page.

Analytics is now off when its flag is false. When enabled, the third-party analytics script shares the page with contact data; an event-key allowlist is not isolation. Local custom events also lack a provider bridge. Safari checks are disabled despite old documentation claiming CI enforcement. The contact page offers no concrete support destination. Generated content adds generic sections to meet word-count gates and sometimes describes unavailable controls.

The checked-in browser report contains zero executed tests and a server-start timeout; it cannot substantiate release claims. The two untracked analytics scripts only render components to strings and likewise cannot establish browser collection behavior.

**Next change:** keep analytics off by default, document any enabled collection accurately, publish only supported workflows, remove word-count incentives, establish a real support channel, and use one dated compatibility record. No operator address or external evidence was invented.

### A15 · P2 · Fuzzy matching excludes scripts and hides some truncation

**Evidence:** `lib/fuzzy.ts`, `normalize`, `blockingKeys`, `findFuzzyMatches`.

ASCII-only name normalization removes non-Latin names. Each candidate bucket retains at most 200 records, but the UI’s cap indicator only describes the total-comparison cap. “Conservative” mode changes the match threshold, not candidate completeness.

**Next change:** keep Unicode letters/numbers, expose both truncation reasons, and describe scores as similarity signals. Keep matches review-only.

### A16 · P2 · CSV protection changes phone values without showing the change

**Evidence:** `lib/tabular.ts`, `csvSafe`, `contactsToRows`, `parseCsv`, `rowsToContacts`; TSV serialization in `lib/contact-tools.ts`; the conversion preview.

Formula protection prefixes values beginning with `+`, `-`, `=` or `@` with an apostrophe. That includes ordinary international phone numbers: `+234...` is exported as `'+234...`. The preview shows the unprefixed row value, while CSV parsing preserves the apostrophe and contact mapping only trims whitespace. A VCF → CSV → VCF conversion can therefore retain the added apostrophe as part of the phone number. TSV uses the same protective convention.

**Next change:** keep a safe default, disclose altered values and preview the actual exported representation. If offering a raw-data export option, make the spreadsheet risk explicit. Do not blindly remove leading apostrophes during import; they can be legitimate source content. Typed spreadsheet cells provide another output choice when exact text preservation matters.

### A17 · P2 · Two file selectors cannot be reached by keyboard

**Evidence:** `components/vcard-transform-workspace.tsx` and `components/vcf-compatibility-workspace.tsx`.

Each Choose VCF control is a styled label wrapping a hidden file input. The label has no keyboard activation behavior and the input is removed from the focus order. Pointer activation works, but a keyboard user has no focusable file-selection control. The transform workspace offers a paste alternative; the compatibility workspace does not.

**Next change:** use a native button to activate a referenced file input, following the pattern already used by other workspaces. Give the button an accessible name and reset the input value so selecting the same file again is dependable.

### A18 · P3 · The supported Node version is not declared at the package boundary

**Evidence:** `package.json`, `package-lock.json`, `.github/workflows/ci.yml`.

CI selects Node 24 and the installed direct dependency `@zxing/library` requires Node 24 or newer, but the root package declares no `engines` constraint. Next's own lower minimum does not describe this repository's full requirements. Local and deployment setup can therefore choose a runtime that is incompatible with a direct dependency without an early project-level warning.

**Next change:** declare a supported Node range compatible with the complete dependency graph and use a matching version selector in local setup and deployment guidance. Keep this as ordinary package configuration; no new runtime-management service is needed.

## Focused changes made during this audit

| Area | Concrete change |
| --- | --- |
| Tool discovery | Fixed irrelevant search matches and removed the duplicated catalogue grid. |
| Editor import/recovery | Cancel reads/workers/timers as one generation; reject stale completions; guard combined bytes; keep Undo available after deleting the last card; restore valid selection on undo/redo. |
| Editor state | Base dirty state on the last loaded/downloaded contacts; current raw view reflects form edits; repeatable values retain aligned type positions; more fields are collapsed by default. |
| Duplicate decisions | Download keeps current contacts; users explicitly merge or keep a primary per group. Merging a non-first primary now includes every other member. |
| Cleanup | Fixed inverted empty removal, retained note/address-only cards, invalidated stale previews, honored redaction selections, and aligned labels with report formats. |
| Tables | Shared paste/mapping flow for bulk creation, TSV imports, real XLSX sample, unique duplicate headers, quoted-delimiter detection, formula-like whitespace handling and sensible type-column mapping. |
| XLSX budgets | Limit archive entries, declared expanded XML bytes, grid dimensions and cell count before allocating broad structures. |
| vCard details | Decode quoted-printable structured values with charset; preserve escaped ADR components; flag actual missing FN; sanitize email type parameters; escape CR; normalize photo MIME type; share UTF-8-byte folding. |
| Viewer | Reopen a file and download the selected decoded source card; retain actual decoded encoding. |
| QR/photo utilities | Escape QR vCard values; load the batch sample; surface over-capacity/skipped output; manage preview URLs in effects; honor final-step photo cancellation. |
| Downloads | One small shared Blob-download helper replaces eight duplicated helpers and is reused by the viewer. |
| Privacy/cache | Analytics flag now controls provider loading. Worker cache is namespaced/bounded, excludes router/query requests, and stores only successful responses. |
| Repository/docs | Ignore environment/generated artifacts, correct direct dependency notices, include font license, and withdraw unsupported completion claims. |

These are implemented source changes. Without running the application or tests, they are not a claim that all affected user flows have been verified. The larger open findings remain open.

## Smallest maintainable direction

1. **Fix the contact core first.** Preserve properties and make output loss explicit. This pays off across nearly every tool.
2. **Make one dependable flow:** choose or paste → inspect actual output → change a small set of options → download → start again. Give destructive decisions Undo and a visible result.
3. **Reduce duplication around the core.** One tool registry, one modest import lifecycle, one download helper, and focused processing functions. Keep native controls and the current CSS foundation; no new state library, backend or framework is needed.
4. **Keep specialist formats secondary** until schema fidelity and external compatibility are documented. Do not make a registered route the definition of a completed tool.
5. **Write less, but make it exact.** Remove repetitive supporting paragraphs and replace generic reassurance with examples and actual limitations. A real syntax/hook linter would improve maintenance more than the current text bans; its installation was not bundled into this audit.

## File-by-file ledger

“Reviewed” means source inspected, not behavior certified. “Open” refers to findings above or the specific limitation in the row. Generated/vendor/binary/reference-only files are explicitly marked. Tests were read only and retained unchanged.

### Application routes

| File | Review / disposition |
| --- | --- |
| [app/about/page.tsx](./app/about/page.tsx) | Reviewed product description and page metadata. Keep claims aligned with actual supported-field coverage. |
| [app/accessibility/page.tsx](./app/accessibility/page.tsx) | Reviewed accessibility statement. Source review cannot establish WCAG conformance or keyboard/screen-reader success. |
| [app/author/page.tsx](./app/author/page.tsx) | Reviewed editorial/author page. Ownership and contact details need real operator information; none invented. |
| [app/browser-support/page.tsx](./app/browser-support/page.tsx) | Reviewed browser guidance. Actual Safari coverage is not currently enforced by the browser-suite configuration. |
| [app/changelog/page.tsx](./app/changelog/page.tsx) | Reviewed release-driven rendering. Keep release claims separate from audit evidence. |
| [app/contact/page.tsx](./app/contact/page.tsx) | Open: there is no usable, concrete support channel on the page; provide an operator-owned address or destination. |
| [app/cookies/page.tsx](./app/cookies/page.tsx) | Reviewed policy copy. Reconcile it with whatever analytics flag is enabled in a real deployment. |
| [app/error.tsx](./app/error.tsx) | Reviewed local error fallback/retry. Dynamic error rendering is one of the CSP cases still unverified. |
| [app/format/[slug]/page.tsx](./app/format/[slug]/page.tsx) | Reviewed async route params, static generation, lookup/not-found and shared content rendering. Depends on content-registry accuracy. |
| [app/format/page.tsx](./app/format/page.tsx) | Reviewed shared directory composition and metadata; no independent processing logic. |
| [app/global-error.tsx](./app/global-error.tsx) | Reviewed root fallback and retry. No runtime or CSP verification performed. |
| [app/globals.css](./app/globals.css) | Reviewed shared visual tokens, breakpoints, focus styles and workspace rules. Dense one-line rules and many global component classes make maintenance harder; avoid a redesign before fixing flows. |
| [app/guide/[slug]/page.tsx](./app/guide/[slug]/page.tsx) | Reviewed static generation, metadata and content lookup. Editorial breadth overstates some available workflows. |
| [app/guide/page.tsx](./app/guide/page.tsx) | Reviewed guide directory and metadata; content quality is the main concern. |
| [app/how-it-works/page.tsx](./app/how-it-works/page.tsx) | Reviewed the local-file workflow explanation; should reflect output limitations and actual previews. |
| [app/icon.svg](./app/icon.svg) | Read the static icon markup; no contact-data flow. |
| [app/layout.tsx](./app/layout.tsx) | Fixed: gate both Vercel Analytics and the local page-view tracker behind the analytics flag. Enabled analytics still shares the page context. |
| [app/loading.tsx](./app/loading.tsx) | Reviewed loading fallback; simple and reusable. |
| [app/manifest.ts](./app/manifest.ts) | Reviewed app-manifest metadata; offline functionality still depends on visited/cached assets. |
| [app/not-found.tsx](./app/not-found.tsx) | Reviewed recovery links and navigation. Production error-path hydration under CSP remains unverified. |
| [app/opengraph-image.tsx](./app/opengraph-image.tsx) | Reviewed generated site social image; no contact data used. |
| [app/page.tsx](./app/page.tsx) | Reviewed home-page hierarchy and embedded editor. Prefer a small set of primary tasks over expanding the catalogue. |
| [app/platform/[slug]/page.tsx](./app/platform/[slug]/page.tsx) | Reviewed route lookup, redirects/static generation and metadata. Platform claims need dated verification. |
| [app/platform/page.tsx](./app/platform/page.tsx) | Reviewed platform directory and metadata; no independent conversion logic. |
| [app/privacy/page.tsx](./app/privacy/page.tsx) | Reviewed local-processing claims. Environment-enabled analytics and same-page script access must be described accurately. |
| [app/robots.ts](./app/robots.ts) | Reviewed crawler rules and preview-deployment behavior; deployed headers not checked. |
| [app/security/page.tsx](./app/security/page.tsx) | Reviewed public security explanation. Do not infer complete file safety from extension/byte guards. |
| [app/sitemap.xml/route.ts](./app/sitemap.xml/route.ts) | Reviewed canonical registry/content enumeration. A listed route is not evidence of correct output. |
| [app/sitemap/page.tsx](./app/sitemap/page.tsx) | Reviewed human-readable sitemap and shared navigation. |
| [app/terms/page.tsx](./app/terms/page.tsx) | Reviewed policy page as product copy; no legal compliance determination. |
| [app/tool/[slug]/opengraph-image.tsx](./app/tool/[slug]/opengraph-image.tsx) | Reviewed dynamic tool social-image lookup and fallback. |
| [app/tool/[slug]/page.tsx](./app/tool/[slug]/page.tsx) | Open: duplicated processor dispatch and eagerly imported workspace catalogue. Table-viewer uses the ordinary card viewer; duplicate photo-extraction definitions disagree between metadata and workspace dispatch (A13). |
| `app/tool/bulk-vcard-creator/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for bulk-vcard-creator. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/compare-vcf-files/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for compare-vcf-files. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/contact-cleaner/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for contact-cleaner. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/csv-to-vcf/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for csv-to-vcf. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/excel-to-vcf/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for excel-to-vcf. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/extract-email-addresses/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for extract-email-addresses. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/extract-phone-numbers/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for extract-phone-numbers. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/merge-vcf/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for merge-vcf. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/normalize-phone-numbers/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for normalize-phone-numbers. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/qr-code-to-vcard/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for qr-code-to-vcard. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/remove-duplicate-contacts/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for remove-duplicate-contacts. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/remove-vcf-photos/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for remove-vcf-photos. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/scan-vcard-qr/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for scan-vcard-qr. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/split-vcf/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for split-vcf. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcard-creator/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcard-creator. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcard-qr-code/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcard-qr-code. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcard-version-converter/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcard-version-converter. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-compatibility-checker/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-compatibility-checker. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-editor/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-editor. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-encoding-fixer/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-encoding-fixer. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-repair/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-repair. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-to-csv/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-to-csv. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-to-excel/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-to-excel. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-to-qr-codes/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-to-qr-codes. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-validator/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-validator. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| `app/tool/vcf-viewer/page.tsx` (consolidated into the registry route) | Reviewed route metadata and workspace wiring for vcf-viewer. Shared engine/workspace findings apply; route presence does not establish output correctness. |
| [app/tools/page.tsx](./app/tools/page.tsx) | Fixed: one searchable tool grid instead of rendering the catalogue twice. |

### Components

| File | Review / disposition |
| --- | --- |
| `components/bulk-vcard-creator.tsx` (removed during implementation) | Simplified to the shared table-conversion workspace with real CSV/TSV paste and column mapping. |
| `components/contact-tool-page.tsx` (removed during implementation) | Reviewed shared page shell. Hand-maintained mode-to-slug mapping duplicates registry/route knowledge. |
| [components/contact-tools-workspace.tsx](./components/contact-tools-workspace.tsx) | Fixed empty removal, explicit per-group duplicate decisions, primary merging, stale cleanup preview, redaction options, report labels and aggregate file guard. Open: very large mode switch, incomplete previews, import races, and no undo for duplicate decisions. |
| [components/content-directory.tsx](./components/content-directory.tsx) | Reviewed reusable directory UI. Retain a simple shared component. |
| [components/content-page.tsx](./components/content-page.tsx) | Reviewed article structure, related links and metadata rendering. Editorial accuracy is inherited from the registry. |
| [components/conversion-workspace.tsx](./components/conversion-workspace.tsx) | Fixed TSV acceptance, repeated export-column controls, real Excel sample, pasted tables, mapping metadata columns, and preserved warnings. Open: preview shows source rows rather than fully mapped output; async imports can finish out of order. |
| [components/fuzzy-workspace.tsx](./components/fuzzy-workspace.tsx) | Reviewed bounded, non-destructive matching. Open: no reopen action, capped candidate coverage not fully disclosed, and score language should avoid implying calibrated probability. |
| [components/page-view-tracker.tsx](./components/page-view-tracker.tsx) | Reviewed route tracking; now mounted only when analytics is enabled. Custom events are not automatically sent to the Vercel provider. |
| [components/pdf-workspace.tsx](./components/pdf-workspace.tsx) | Reviewed PDF download and local font fetching. Open: static heavy imports, no cancellation, and reopening during creation can leave a stale download. |
| [components/photo-workspace.tsx](./components/photo-workspace.tsx) | Fixed preview object-URL lifecycle and cancellation before the final download; prevent reopening during compression. Open: image-pixel allocation remains unbounded and file-read races remain. |
| [components/qr-code-reader-workspace.tsx](./components/qr-code-reader-workspace.tsx) | Open: camera permission/play/detection lifecycle can leak a stream or reject without recovery; no image-size/pixel bound; failed replacement images leave a previous payload downloadable. |
| [components/referral-link.tsx](./components/referral-link.tsx) | Reviewed external referral link and coarse event instrumentation; no contact payload is passed. |
| [components/service-worker-register.tsx](./components/service-worker-register.tsx) | Reviewed production-only registration. Registration failures are intentionally silent; updates/offline readiness are not surfaced. |
| [components/site-chrome.tsx](./components/site-chrome.tsx) | Reviewed shared navigation, footer, skip link and information-page shell. Keep shared chrome small; avoid repeating all catalogue choices in primary navigation. |
| [components/sqlite-workspace.tsx](./components/sqlite-workspace.tsx) | Consolidated downloads. Open: inferred table mapping is limited, user cannot choose a table, and async completion can outlive the selected input. |
| [components/standards-workspace.tsx](./components/standards-workspace.tsx) | Fixed stale output after input edits and accessible textarea labels; replaced internal telemetry bucket with plain status. Underlying format correctness remains P1. |
| [components/structured-data.tsx](./components/structured-data.tsx) | Reviewed JSON-LD serialization and script-safe escaping. Descriptions must remain consistent with real functionality. |
| [components/tool-search.tsx](./components/tool-search.tsx) | Fixed query contamination that made irrelevant tools match; one real filtered grid and a concise announced result count. |
| [components/tool-supporting-content.tsx](./components/tool-supporting-content.tsx) | Reviewed shared tool explanation blocks. Generic repeated text obscures task-specific limits and adds scrolling. |
| [components/vcard-creator.tsx](./components/vcard-creator.tsx) | Fixed the five-part address input to occupy the correct vCard ADR positions. Open: semicolon-based input is a poor address editor and the flow still relies on the flattened serializer. |
| [components/vcard-editor.tsx](./components/vcard-editor.tsx) | Fixed worker/read cancellation races, aggregate file guard, raw/form staleness, last-contact undo recovery, undo/redo selection, dirty-state baseline, mounted chooser, and advanced-field disclosure. Open: all-field preservation, per-keystroke whole-list history, live validation, and internal-navigation draft loss. |
| [components/vcard-qr-workspace.tsx](./components/vcard-qr-workspace.tsx) | Fixed vCard escaping, actual batch sample, visible QR capacity errors, and skipped-card count; shared downloads. Open: synchronous batch generation and automatic dual download may be blocked by browser policy. |
| [components/vcard-text-tools-workspace.tsx](./components/vcard-text-tools-workspace.tsx) | Consolidated downloads; now uses byte-aware folding through the library. Open: pasted text is transformed on each keystroke without a byte limit. |
| [components/vcard-transform-workspace.tsx](./components/vcard-transform-workspace.tsx) | Fixed stale output on input/version changes and textarea labels. Open: flattened version conversion, unbounded paste and a file chooser inaccessible by keyboard (A17). |
| [components/vcard-viewer.tsx](./components/vcard-viewer.tsx) | Fixed reopen/download-selected actions, reported decoding and accessible search. Open: unbounded rendered list and no actual table-view mode; downloaded raw card is decoded/unfolded, not byte-identical. |
| [components/vcf-compare-workspace.tsx](./components/vcf-compare-workspace.tsx) | Open: compares only UID/name/phone/email keys, ignores other changed fields and duplicate multiplicity; offers added/removed but no changed-record result. |
| [components/vcf-compatibility-workspace.tsx](./components/vcf-compatibility-workspace.tsx) | Open: profiles share the same validation; changing profile leaves the old report; real decoding information is discarded; file selection is inaccessible by keyboard (A17). |

### Libraries

| File | Review / disposition |
| --- | --- |
| [lib/analytics.ts](./lib/analytics.ts) | Reviewed key allowlist and disabled-by-default local events. Keys are restricted but arbitrary string values are not intrinsically private; no provider bridge exists for these custom events. |
| [lib/contact-tools.ts](./lib/contact-tools.ts) | Fixed meaningful-empty detection, merge-primary handling, repeated-field type alignment and TSV formula prefixing. Open: extension-unsafe phone normalization, broad normalization side effects, flattened redaction and summary-only field metrics. |
| [lib/content-registry.ts](./lib/content-registry.ts) | Reviewed all registry sections and generated additions. Open: content-volume padding, incorrect tool handoffs, unavailable sheet/pre-export review instructions, and overstated preservation/redaction claims. |
| [lib/download.ts](./lib/download.ts) | New small shared browser-download helper; appends/removes the anchor and releases the object URL. Browser save completion is not observable. |
| [lib/feature-flags.ts](./lib/feature-flags.ts) | Reviewed flag definitions. Analytics is now effective; ads/sentry exports are unused configuration, not implemented capabilities. |
| [lib/file-guard.ts](./lib/file-guard.ts) | Added aggregate VCF selection/append byte checks. Extension and byte checks do not bound every format’s decoded workload. |
| [lib/filenames.ts](./lib/filenames.ts) | Reviewed sanitized collision-resistant archive naming. Reuse this helper instead of maintaining several filename variants. |
| [lib/fuzzy.ts](./lib/fuzzy.ts) | Open: normalization discards non-Latin scripts; 200-per-bucket truncation can hide candidate omissions even before the 50,000-comparison cap. |
| [lib/page-metadata.ts](./lib/page-metadata.ts) | Reviewed canonical/Open Graph metadata construction; do not use metadata status as functionality evidence. |
| [lib/pdf.ts](./lib/pdf.ts) | Open: page overflow and unwrapped names/words. Confirmed font-subset gaps and missing-glyph acceptance in the font chooser (A08); encoding success does not establish coverage or shaping. |
| [lib/photos.ts](./lib/photos.ts) | Added encoded-length check before base64 allocation. Existing signature/MIME checks help; decoded pixel dimensions and aggregate resource use still need limits. |
| [lib/qr.ts](./lib/qr.ts) | Reviewed use of ZXing for encoding and matrix-only SVG generation. Payload text is not injected into SVG markup. |
| [lib/release.ts](./lib/release.ts) | Reviewed release metadata; release version differs from package.json and descriptive claims need one authoritative source. |
| [lib/site-config.ts](./lib/site-config.ts) | Reviewed public origins and referral URL defaults. Validate deployment URLs operationally; do not introduce accounts or config services for this. |
| [lib/sqlite.ts](./lib/sqlite.ts) | Open: direct-schema detection checks three table names but assumes categories and required columns exist; fallback chooses only first table and silently limits to 100,000 rows. Export closes the DB and uses parameterized inserts. |
| [lib/standards.ts](./lib/standards.ts) | Open P1: jCard structured values, xCard namespace/structure, and JSContact field schema are incorrect; LDIF DN escaping and loss reporting also incomplete. |
| [lib/tabular-headers.ts](./lib/tabular-headers.ts) | New small shared helper preserves repeated/blank source columns with unique mapping keys and an explicit warning. |
| [lib/tabular.ts](./lib/tabular.ts) | Fixed duplicate headers, quoted delimiter detection, unclosed-quote warning, formula-like whitespace and type-column mapping. Open: scalar mapping collisions, UTF-8-only CSV reads and undisclosed apostrophe prefixes retained on reimport (A16). |
| [lib/tools-registry.ts](./lib/tools-registry.ts) | Reviewed every registered tool and alias. Processor metadata does not drive all route implementations; status labels overstate confidence for some workflows. |
| [lib/vcard-text-tools.ts](./lib/vcard-text-tools.ts) | Fixed line folding to count UTF-8 bytes through the shared serializer helper. Synthetic data remains a utility, not production compatibility evidence. |
| [lib/vcard-worker.ts](./lib/vcard-worker.ts) | Reviewed isolated parse/progress message contract. Editor now invalidates stale jobs; progress is coarse and other workspaces still parse on the main thread. |
| [lib/vcard.ts](./lib/vcard.ts) | Fixed quoted-printable structured fields/charset, missing-FN detection, escaped address components, CR escaping, email type sanitization and photo media type. Open P1: flattened known fields/parameters lose information on export. |
| [lib/xlsx.ts](./lib/xlsx.ts) | Fixed bounded ZIP entry/expanded-size processing, worksheet grid limits and duplicate header keys. Open: regex XML subset, first-sheet choice, styles/date/display handling and unsupported constructs need explicit reporting. |

### Assets

| File | Review / disposition |
| --- | --- |
| [public/BingSiteAuth.xml](./public/BingSiteAuth.xml) | Read static site-verification asset; ownership validity not verified externally. |
| [public/fonts/OFL.txt](./public/fonts/OFL.txt) | Copied upstream Noto Sans license for the bundled font files. |
| [public/fonts/noto-sans-cyrillic-ext-400.woff2](./public/fonts/noto-sans-cyrillic-ext-400.woff2) | Parsed WOFF2 metadata and character map: 391 glyphs; extended subset lacks basic Cyrillic Ж and Latin A. Matches the upstream regular asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-cyrillic-ext-700.woff2](./public/fonts/noto-sans-cyrillic-ext-700.woff2) | Parsed WOFF2 metadata and character map: 391 glyphs; extended subset lacks basic Cyrillic Ж and Latin A. Matches the upstream bold asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-devanagari-400.woff2](./public/fonts/noto-sans-devanagari-400.woff2) | Parsed WOFF2 metadata and character map: 642 glyphs; includes Devanagari अ, lacks basic Latin A. Matches the upstream regular asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-devanagari-700.woff2](./public/fonts/noto-sans-devanagari-700.woff2) | Parsed WOFF2 metadata and character map: 642 glyphs; includes Devanagari अ, lacks basic Latin A. Matches the upstream bold asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-greek-ext-400.woff2](./public/fonts/noto-sans-greek-ext-400.woff2) | Parsed WOFF2 metadata and character map: 261 glyphs; extended subset lacks basic Greek Ω and Latin A. Matches the upstream regular asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-greek-ext-700.woff2](./public/fonts/noto-sans-greek-ext-700.woff2) | Parsed WOFF2 metadata and character map: 261 glyphs; extended subset lacks basic Greek Ω and Latin A. Matches the upstream bold asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-latin-ext-400.woff2](./public/fonts/noto-sans-latin-ext-400.woff2) | Parsed WOFF2 metadata and character map: 1,399 glyphs; includes Ā, lacks basic Latin A. Matches the upstream regular asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-latin-ext-700.woff2](./public/fonts/noto-sans-latin-ext-700.woff2) | Parsed WOFF2 metadata and character map: 1,399 glyphs; includes Ā, lacks basic Latin A. Matches the upstream bold asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-vietnamese-400.woff2](./public/fonts/noto-sans-vietnamese-400.woff2) | Parsed WOFF2 metadata and character map: 139 glyphs; includes ệ, lacks basic Latin A. Matches the upstream regular asset byte for byte. A08 applies; not visually rendered. |
| [public/fonts/noto-sans-vietnamese-700.woff2](./public/fonts/noto-sans-vietnamese-700.woff2) | Parsed WOFF2 metadata and character map: 139 glyphs; includes ệ, lacks basic Latin A. Matches the upstream bold asset byte for byte. A08 applies; not visually rendered. |
| [public/google746c0df948a91617.html](./public/google746c0df948a91617.html) | Read static site-verification asset; ownership validity not verified externally. |
| [public/icon.svg](./public/icon.svg) | Read duplicated public icon markup. Consolidate assets only if needed; no functional issue identified here. |
| [public/samples/sample-contacts.vcf](./public/samples/sample-contacts.vcf) | Read synthetic sample content; useful onboarding, not comprehensive interoperability evidence. |
| [public/sw.js](./public/sw.js) | Fixed: versioned cache namespace, own-cache cleanup, successful-response-only storage, bounded entries and static-asset allowlist; exclude query/RSC router requests. Offline/update behavior not runtime-verified. |

### Existing tests and fixtures — not executed

| File | Review / disposition |
| --- | --- |
| [tests/advanced-formats.test.ts](./tests/advanced-formats.test.ts) | Read only; not run. Local exports and self-imports do not establish external PDF/SQLite/format compatibility. |
| [tests/analytics.test.ts](./tests/analytics.test.ts) | Read only; not run. Event metadata/flag coverage is distinct from third-party provider loading and network collection. |
| [tests/audit-regressions.test.ts](./tests/audit-regressions.test.ts) | Read only; not run. Existing regression definitions reviewed; no new assertions or execution in this audit. |
| [tests/compatibility.test.ts](./tests/compatibility.test.ts) | Read only; not run. Synthetic fixtures do not establish real Apple/Google/Outlook imports. |
| [tests/contact-tools-expansion.test.ts](./tests/contact-tools-expansion.test.ts) | Read only; not run. Operation examples reviewed; catalogue coverage does not imply preservation of every field. |
| [tests/contact-tools.test.ts](./tests/contact-tools.test.ts) | Read only; not run. Duplicate/cleanup examples reviewed; review decisions and overlapping groups need stronger behavioral coverage later. |
| [tests/e2e/core.spec.ts](./tests/e2e/core.spec.ts) | Read browser-flow/axe/route checks only. Mostly smoke coverage; ignores some analytics failures and cannot certify every catalogue flow. Not run. |
| [tests/file-guard.test.ts](./tests/file-guard.test.ts) | Read only; not run. Extension/byte guard examples reviewed; no expanded-archive or decoded-image assurance. |
| [tests/fixtures/README.md](./tests/fixtures/README.md) | Read fixture inventory and synthetic-data guidance; no user data needed for the source audit. |
| [tests/fixtures/clean-2-1.vcf](./tests/fixtures/clean-2-1.vcf) | Read synthetic clean-2-1 fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/clean-3-0.vcf](./tests/fixtures/clean-3-0.vcf) | Read synthetic clean-3-0 fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/clean-4-0.vcf](./tests/fixtures/clean-4-0.vcf) | Read synthetic clean-4-0 fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/hostile-values.vcf](./tests/fixtures/hostile-values.vcf) | Read synthetic hostile-values fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/malformed-missing-end.vcf](./tests/fixtures/malformed-missing-end.vcf) | Read synthetic malformed-missing-end fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/mixed-version.vcf](./tests/fixtures/mixed-version.vcf) | Read synthetic mixed-version fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/multi-duplicate.vcf](./tests/fixtures/multi-duplicate.vcf) | Read synthetic multi-duplicate fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/quoted-printable.vcf](./tests/fixtures/quoted-printable.vcf) | Read synthetic quoted-printable fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/unicode.vcf](./tests/fixtures/unicode.vcf) | Read synthetic unicode fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/fixtures/unknown-extensions.vcf](./tests/fixtures/unknown-extensions.vcf) | Read synthetic unknown-extensions fixture; retained unchanged. A fixture documents cases, not proof that the current implementation handles them. |
| [tests/launch.test.ts](./tests/launch.test.ts) | Read only; not run. Registry/configuration assertions reviewed; not launch or production evidence. |
| [tests/legacy-xls.test.ts](./tests/legacy-xls.test.ts) | Read only; not run. Legacy workbook import assertions reviewed; no external workbook corpus execution. |
| [tests/parser-fuzz.test.ts](./tests/parser-fuzz.test.ts) | Read only; not run. Fuzz definitions reviewed; bounds and uncommon structured values still have open issues. |
| [tests/performance/benchmark.test.ts](./tests/performance/benchmark.test.ts) | Read benchmark definition only; fixed local limits are not a mobile-device responsiveness guarantee. Not run. |
| [tests/qr.test.ts](./tests/qr.test.ts) | Read only; not run. QR algorithm coverage reviewed; camera lifecycle and batch workflow remain distinct. |
| [tests/seo.test.ts](./tests/seo.test.ts) | Read only; not run. Word-count/section-count requirements encourage repetitive content; replace volume goals with accuracy and useful examples. |
| [tests/standards.test.ts](./tests/standards.test.ts) | Read only; not run. Self-round-trip assumptions miss incompatible jCard/xCard/JSContact schemas. |
| [tests/tabular.test.ts](./tests/tabular.test.ts) | Read only; not run. Table examples reviewed; duplicate headers and mapping semantics fixed from source analysis. |
| [tests/vcard-text-tools.test.ts](./tests/vcard-text-tools.test.ts) | Read only; not run. Existing folding/generator definitions reviewed; byte-aware behavior changed without running tests. |
| [tests/vcard.test.ts](./tests/vcard.test.ts) | Read only; not run. Parser/serializer examples reviewed; field-retention coverage is incomplete. |

### Configuration, scripts and documentation

| File | Review / disposition |
| --- | --- |
| [.env.example](./.env.example) | Reviewed the example flags and public URL settings. Analytics now obeys its flag; advertising and error-reporting flags do not implement those features. |
| [.github/dependabot.yml](./.github/dependabot.yml) | Dependency-update configuration reviewed. An update bot is not evidence that the installed tree has no vulnerabilities. |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | CI wiring reviewed only. Unit, compatibility and benchmark invocations overlap; WebKit is installed but its projects are disabled. |
| [.gitignore](./.gitignore) | Fixed: ignore local environment files and generated test/report folders; retain the example environment file. Already tracked reports remain tracked. |
| [AGENTS.md](./AGENTS.md) | Read the framework guidance; installed Next CSP and server/client documentation consulted before edits. |
| [CHANGELOG.md](./CHANGELOG.md) | Historical release claims reviewed; not evidence of current execution. See current audit limitations. |
| [CLAUDE.md](./CLAUDE.md) | Reviewed the pointer to repository agent instructions. |
| [CODE_AUDIT.md](./CODE_AUDIT.md) | Replaced the previous audit with this source-based assessment and complete file ledger. |
| [COMPATIBILITY_LAB.md](./COMPATIBILITY_LAB.md) | Useful compatibility plan and fixture inventory; destination-platform coverage still needs dated external evidence. |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment instructions reviewed. Reassess hash-based CSP and service-worker rollout before relying on deployment guarantees. |
| [IMPLEMENTATION_AUDIT.md](./IMPLEMENTATION_AUDIT.md) | Replaced unsupported code-complete and WebKit-enforcement claims with the current implementation status. |
| [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) | Useful operational checklist; checklist items are not proof of completed verification. |
| [PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md) | Local-processing intent is good. Enabled third-party analytics still shares the contact-processing page; isolation claims need revision. |
| [README.md](./README.md) | Added known implementation limits and the current audit link; softened completeness/editorial claims. |
| [RELEASE_NOTES.md](./RELEASE_NOTES.md) | Historical product summary reviewed. Package and release-metadata versions differ; avoid presenting past checks as current. |
| [SECURITY.md](./SECURITY.md) | Reviewed the reporting and security guidance. Input resource limits remain uneven; no dependency/security certification in this audit. |
| [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) | Corrected obsolete SheetJS inventory and recorded every direct runtime dependency from local package metadata; added the bundled font license. |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | Reviewed local processing and attacker-controlled files. Expanded archive size, decoded image dimensions and third-party scripts remain relevant boundaries. |
| [VCARDEDITOR_MASTER_README.md](./VCARDEDITOR_MASTER_README.md) | Read all 4,710 lines / 43 sections. Essential field preservation, honest conversion previews and simple recovery are still incomplete. Optional catalogue, stack, monorepo and monetization proposals are not instructions to expand scope or implementation evidence. |
| [next-env.d.ts](./next-env.d.ts) | Generated Next type references inspected; left framework-owned file unchanged. |
| [next.config.ts](./next.config.ts) | Reviewed headers, redirects and SRI. Corrected the SRI comment; global inline-hash CSP and dynamic-error behavior remain deployment concerns. |
| [package-lock.json](./package-lock.json) | Audited all 182 package records and 259 dependency/optional/peer relationships structurally; no graph mismatch found. Reviewed origins, integrity, license and install-script metadata. No vendor source or advisory certification. |
| [package.json](./package.json) | Reviewed scripts and dependencies. Missing root Node requirement (A18), no semantic linter, duplicate CI suites and two version sources; no packages added. |
| [playwright-report/index.html](./playwright-report/index.html) | Inspected generated HTML structure and decoded its complete embedded result payload: zero tests and a web-server startup timeout. The vendored viewer bundle is not first-party source. Report retained unchanged. |
| [playwright.config.ts](./playwright.config.ts) | Reviewed configuration only. Safari/WebKit disabled; long serial suites and reused local server can obscure which build is being checked. |
| `scripts/csp-hashes.mjs` (removed during implementation) | Open: global union of inline hashes grows with all prerendered pages, mutates private build output, and cannot cover arbitrary runtime HTML. No build executed. |
| `scripts/lint.mjs` (removed during implementation) | Reviewed and ran: two regex bans for dynamic evaluation and console logging. It is not ESLint, a hook checker, accessibility linting or a maintainability gate. |
| [test-analytics-next.mjs](./test-analytics-next.mjs) | Read existing untracked server-render snippet using the Next analytics entry point; not wired into package scripts. Not executed or modified; cannot establish browser analytics behavior. |
| [test-analytics.mjs](./test-analytics.mjs) | Read existing untracked server-render snippet using the React analytics entry point; not wired into package scripts. Not executed or modified; cannot establish browser analytics behavior. |
| [test-results/.last-run.json](./test-results/.last-run.json) | Read historical generated status: failed, with no failed test IDs recorded. Retained unchanged; not evidence of a current run. |
| [tsconfig.json](./tsconfig.json) | Reviewed strict TypeScript/build settings. Static typing cannot validate format schemas or user flows. |
| [tsconfig.tsbuildinfo](./tsconfig.tsbuildinfo) | Parsed ignored compiler cache metadata: TypeScript 5.9.3, 1,141 input records. Derived incremental-build state, not application logic or release evidence. |
| [types/sqljs-asm.d.ts](./types/sqljs-asm.d.ts) | Reviewed narrow ambient declaration; sql.js runtime and schema assumptions still need error handling. |
| [vitest.config.ts](./vitest.config.ts) | Read existing suite configuration; no tests executed or modified. |

Ledger total: **188 files** (109 application/component/library files, plus configuration, scripts, documents, assets, existing test material and the explicitly listed generated artifacts). Includes the two pre-existing untracked user scripts, read without modification. Every project file outside `.next/`, `node_modules/` and `.git/` has one ledger entry. Generated artifacts and binary assets received the type-appropriate review described above; this is not a claim of line-by-line review of third-party bundles or runtime verification.

## Implementation additions to the file ledger

These files were added after the 188-file baseline. Their code or contents were reviewed during implementation.

| File | Purpose |
| --- | --- |
| `.node-version` | Node 24 runtime selector. |
| `eslint.config.mjs` | Semantic TypeScript, unused-code and React hook rules. |
| `proxy.ts` | Request nonce and bounded CSP; no shared document caching. |
| `components/tool-workspace.tsx` | Typed, lazy workspace dispatcher. |
| `components/contact-change-preview.tsx` | Before/after field preview and complete downloadable change list. |
| `lib/compare.ts` | Full-property, multiplicity-aware backup comparison. |
| `lib/contact-changes.ts` | Derive materialized field changes for previews. |
| `lib/editor-session.ts` | Browser-only in-memory editor recovery across navigation. |
| `lib/image-file.ts` | Encoded-image dimensions, byte/pixel bounds and URL cleanup. |
| `lib/use-local-operation.ts` | Small cancellation and stale-result lifecycle. |
| `lib/xml.ts` | Strict shared XML parser; no DTD/entities or parser logging. |
| `public/offline.html` | Explicit disconnected-navigation fallback. |
| `public/fonts/noto-sans-latin-400.woff2` | Upstream OFL base Latin regular font subset. |
| `public/fonts/noto-sans-latin-700.woff2` | Upstream OFL base Latin bold font subset. |
| `public/fonts/noto-sans-cyrillic-400.woff2` | Upstream OFL base Cyrillic regular font subset. |
| `public/fonts/noto-sans-cyrillic-700.woff2` | Upstream OFL base Cyrillic bold font subset. |
| `public/fonts/noto-sans-greek-400.woff2` | Upstream OFL base Greek regular font subset. |
| `public/fonts/noto-sans-greek-700.woff2` | Upstream OFL base Greek bold font subset. |
| `SUPPORTED_FORMATS.md` | Current format subsets, input budgets and conversion limitations. |

The pre-existing untracked analytics snippets remain unchanged. Generated compiler artifacts are excluded from source changes. Current verification results are in `IMPLEMENTATION_AUDIT.md`.
