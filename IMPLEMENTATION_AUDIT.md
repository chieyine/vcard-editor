# Audit implementation record

Updated 2026-09-27. The code recommendations for all 18 findings in [the completed audit](./CODE_AUDIT.md) have been implemented. This records source changes; it does not certify runtime behavior or external compatibility. The original 188-file ledger remains as the historical baseline.

## Changes by finding

| Finding | Implementation | Principal files |
| --- | --- | --- |
| A01 · Preserve contact data | Keep original ordered properties, groups, parameters, repeated values and source blocks. Patch edited form fields; retain unchanged structured components and metadata. Merge retains secondary repeatable properties and separates colliding groups. Conversions show loss notes. | `lib/vcard.ts`, `lib/contact-tools.ts` |
| A02 · Correct standards | Correct JSContact 1.0 fields, jCard arrays/parameters/dates, xCard namespace/structured elements and LDIF DN escaping. Reject unsupported imports; disclose export omissions and beta scope. | `lib/standards.ts`, `lib/xml.ts`, `components/standards-workspace.tsx`, `SUPPORTED_FORMATS.md` |
| A03 · Constrain cleanup | Preserve extensions and regional digits. Treat country codes as explicit literal prefixes. Ignore invalid phone comparison keys; normalize email independently. Preview field changes. | `lib/contact-tools.ts`, `components/contact-change-preview.tsx` |
| A04 · Recover QR operations | Reject late permission results, stop tracks on all exits, invalidate stale images/payloads, and validate image byte/pixel budgets before decoding. | `components/qr-code-reader-workspace.tsx`, `lib/image-file.ts` |
| A05 · Compare full records | Match by stated identity, compare all materialized properties, preserve multiplicity, and report changed/added/removed/ambiguous records. | `lib/compare.ts`, `components/vcf-compare-workspace.tsx` |
| A06 · Explicit redaction | Rebuild from reviewed retained properties. Strip unknown properties, groups and unrecognized parameters by default only in the sharing flow; ordinary edits preserve them. | `lib/contact-tools.ts`, `components/contact-tools-workspace.tsx` |
| A07 · Spreadsheet boundaries | Use a real XML parser, select visible/named sheets, recognize common formats, warn about unsupported formatting, reject scalar mapping collisions and preview mapped output. | `lib/xlsx.ts`, `lib/xml.ts`, `lib/tabular.ts`, `components/conversion-workspace.tsx` |
| A08 · PDF integrity | Wrap names/long words, paginate within contacts, select fonts by character coverage and preserve grapheme runs. Add base font subsets, reject missing glyphs, offer HTML and support cancellation. | `lib/pdf.ts`, `components/pdf-workspace.tsx`, `public/fonts/` |
| A09 · Honest compatibility | Replace cosmetic destination profiles with a syntax report tied to the current input and actual decoder encoding. | `components/vcf-compatibility-workspace.tsx` |
| A10 · Supported CSP | Use request nonces and dynamic documents. Remove private build-manifest mutation/hash aggregation. Do not cache nonce-bearing HTML. Explicit WASM permission supports local SQLite. | `proxy.ts`, `app/layout.tsx`, `components/structured-data.tsx`, `public/sw.js`, `DEPLOYMENT.md` |
| A11 · Bounded operations | Shared operation tokens cancel/invalidate stale work. Add text, record, grid, image, PDF and QR budgets. Validate SQLite schema/counts; remove silent truncation. Worker timeout fails recoverably; small fallback is bounded. | `lib/use-local-operation.ts`, `lib/file-guard.ts`, workspaces, `lib/sqlite.ts` |
| A12 · Editor recovery | Validate current values; show current versions. Coalesce history by field transaction, preserve custom display names, protect raw drafts and retain one session in tab memory across navigation. Add virtual-list keyboard traversal. | `components/vcard-editor.tsx`, `lib/editor-session.ts` |
| A13 · Simpler flows | Four primary tasks; one registry supplies routing/metadata/dispatch. Remove 26 route wrappers and unused wrappers. Lazy-load workspaces; implement table view, report/change previews, consistent reopen, undo and merge-to-review handoff. | `lib/tools-registry.ts`, `app/tool/[slug]/page.tsx`, `components/tool-workspace.tsx`, shared workspaces |
| A14 · Accurate operations | Remove mounted analytics provider and generic word-count expansion. Keep optional diagnostics local. Configure CI WebKit without claiming a pass, centralize package version, and add support@vcardeditor.com. | layout, content registry, privacy/docs, CI, contact page, `lib/release.ts` |
| A15 · Unicode matching | Retain Unicode letters/numbers/marks; disclose per-bucket and total-comparison caps and bounded similarity strings. Keep review-only decisions. | `lib/fuzzy.ts`, `components/fuzzy-workspace.tsx` |
| A16 · CSV transparency | Show actual protected values, including phone apostrophes. Safe default and explicit raw option; do not strip ambiguous source apostrophes on import. | `lib/tabular.ts`, conversion/extraction/TSV previews |
| A17 · Keyboard file access | Use native buttons with referenced/resettable file inputs. | transform and compatibility workspaces |
| A18 · Runtime requirement | Declare Node 24 in manifest/lockfile and `.node-version`; CI and deployment documentation use it. | package files, `.node-version`, CI |

ESLint now checks TypeScript and React hooks instead of two text patterns. Updated source is formatted with Prettier. Dependency advisories discovered during setup were addressed through framework, archive-parser and development-tool updates; the lockfile is the exact version record.

## Verification boundary

No agents, tests, added tests, browser sessions, production build, deployment or address-book imports were used. Static lint, type generation/type checking, service-worker/config syntax and patch-whitespace checks are recorded at completion below. Existing route/metadata assertions were aligned with consolidated routing, and obsolete SEO word-count assertions were removed. No test was added or executed.

Host CSP behavior (including errors/404s), camera permission races, PDF layout/shaping, keyboard behavior, external format imports, offline navigation and the configured browser matrix still need runtime verification before a release claim. [Deployment guidance](./DEPLOYMENT.md) lists these checks. [Conversion boundaries](./SUPPORTED_FORMATS.md) document supported subsets; the dated `/platform/compatibility-matrix` records that no current external destination verification exists.

The two existing untracked analytics scratch scripts remain untouched. No commit or deployment was created.

## Final static results

- TypeScript check: passed after the final XML, serializer and editor changes.
- Next.js route type generation: passed after route consolidation and framework update.
- Service-worker and ESLint configuration syntax: passed.
- Patch whitespace: passed.
- Dependency installation audit: zero known vulnerabilities after updating Next.js to 16.3.6, fflate to 0.8.3 and Vitest to the patched 4.1 line.
- ESLint (including React hooks): passed with zero warnings.

These checks inspect source/configuration and dependency advisories; they do not establish runtime compatibility.
