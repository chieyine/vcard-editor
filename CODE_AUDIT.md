# File-by-file code audit

Reviewed on 2026-08-11 against `VCARDEDITOR_MASTER_README.md`. “Verified” means the file was read in context and covered by type checking, linting, tests, static generation, or the production build as appropriate.

## Project and delivery files

| File | Result |
| --- | --- |
| `package.json` / `package-lock.json` | Verified scripts, pinned dependency graph, Playwright/axe tooling, real PDF/SQLite support, and zero known audit findings. |
| `next.config.ts` | Verified strict mode, canonical host redirect, CSP, HSTS, content-type, referrer, frame, opener/resource, and least-privilege feature policies. |
| `tsconfig.json` / `eslint.config.mjs` | Verified strict compilation and repository lint entry points. |
| `playwright.config.ts` | Verified desktop/mobile Chromium, desktop Firefox, and CI WebKit projects, bounded actions, deterministic workers, traces, screenshots, and videos on failure. |
| `.github/workflows/ci.yml` | Verified install, security audit, lint, types, unit tests, compatibility, benchmark, production build, browser install, and E2E checks. |
| `public/sw.js` | Verified same-origin cache, old-cache cleanup, successful-response caching, navigation fallback, and no cross-origin interception. |
| `public/icon.svg`, `public/fonts/*`, `public/samples/sample-contacts.vcf` | Verified local brand asset, licensed self-hosted PDF font subsets, and safe demonstrator fixture. |
| `scripts/lint.mjs` | Verified source-file discovery and banned-pattern checks. |

## Application shell and SEO

| File or group | Result |
| --- | --- |
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | Verified global metadata, privacy-safe shell integrations, responsive homepage, design system, focus states, and WCAG contrast corrections. |
| `app/error.tsx`, `app/global-error.tsx`, `app/loading.tsx`, `app/not-found.tsx` | Verified route, global, loading, and missing-page recovery states. |
| `app/manifest.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/icon.svg` | Verified PWA metadata, crawler policy, build-safe social image, and icon. |
| `app/sitemap.xml/route.ts`, `app/sitemap/page.tsx` | Verified machine and human sitemaps from the same registries. |
| `app/tools/page.tsx`, `app/guide/page.tsx`, `app/format/page.tsx`, `app/platform/page.tsx` | Verified crawlable directories and registry-driven discovery. |
| `app/guide/[slug]/page.tsx`, `app/format/[slug]/page.tsx`, `app/platform/[slug]/page.tsx` | Verified static params, unique metadata, canonical URLs, missing-page handling, and structured content. |
| `app/about`, `accessibility`, `author`, `browser-support`, `changelog`, `contact`, `cookies`, `how-it-works`, `privacy`, `security`, `terms` | Verified all trust, policy, help, and ownership pages render and enter the sitemap/footer. |

## Tool routes

| File or group | Result |
| --- | --- |
| `app/tool/[slug]/page.tsx` | Verified 72 expansion routes, static generation, unique metadata, real processor dispatch, 404 handling, and structured data. |
| `app/tool/vcf-editor`, `vcf-viewer`, `vcard-creator`, `bulk-vcard-creator` | Verified flagship open/edit/view/create workflows. |
| `app/tool/csv-to-vcf`, `vcf-to-csv`, `excel-to-vcf`, `vcf-to-excel` | Verified real tabular conversion routes and mapping workspaces. |
| `app/tool/merge-vcf`, `split-vcf`, `compare-vcf-files` | Verified multi-file merge, ZIP split, and comparison routes. |
| `app/tool/contact-cleaner`, `remove-duplicate-contacts`, `normalize-phone-numbers`, `remove-vcf-photos`, `vcf-repair`, `vcf-validator` | Verified review-first cleanup, repair, and validation routes. |
| `app/tool/vcard-version-converter`, `vcf-encoding-fixer`, `vcf-compatibility-checker` | Verified standards transformation and conservative compatibility routes. |
| `app/tool/extract-phone-numbers`, `extract-email-addresses` | Verified local extraction and safe CSV download routes. |
| `app/tool/vcard-qr-code`, `vcf-to-qr-codes`, `qr-code-to-vcard`, `scan-vcard-qr` | Verified generation, ZIP export, image decoding, and explicit-permission camera routes. |

## Components

| File | Result |
| --- | --- |
| `components/site-chrome.tsx` | Verified desktop/mobile navigation, skip target compatibility, trust links, and full footer. |
| `components/vcard-editor.tsx` | Verified worker lifecycle, multi-file parsing, cancellation, virtualization, editing, selection, history, bulk operations, and export review. |
| `components/vcard-viewer.tsx`, `components/vcard-creator.tsx`, `components/bulk-vcard-creator.tsx` | Verified read-only, single-create, and mapped bulk-create experiences. |
| `components/conversion-workspace.tsx` | Verified file guards, spreadsheet mapping, preview, real CSV/XLSX output, data-only legacy XLS import, and download flow. |
| `components/contact-tools-workspace.tsx`, `components/contact-tool-page.tsx` | Verified all local clean, merge, split, extract, transform, report, and wrapper modes. |
| `components/standards-workspace.tsx`, `components/vcard-transform-workspace.tsx`, `components/vcard-text-tools-workspace.tsx` | Verified JSON/XML/directory standards, version/encoding, and folding/test-data workspaces. |
| `components/sqlite-workspace.tsx`, `components/pdf-workspace.tsx` | Verified real binary database and PDF user flows. |
| `components/photo-workspace.tsx` | Verified signature validation, safe previews, ZIP extraction, bounded canvas resize, cancellation, and blob cleanup. |
| `components/fuzzy-workspace.tsx` | Verified threshold presets, explainable match review, caps, and report export. |
| `components/vcard-qr-workspace.tsx`, `components/qr-code-reader-workspace.tsx` | Verified standards-valid local QR create/read, offline decoder fallback, camera lifecycle cleanup, and no-upload behavior. |
| `components/vcf-compare-workspace.tsx`, `components/vcf-compatibility-workspace.tsx` | Verified comparison summaries and non-overstated compatibility reporting. |
| `components/content-directory.tsx`, `components/content-page.tsx`, `components/tool-search.tsx` | Verified crawlable content, related links, search labels, and empty states. |
| `components/structured-data.tsx` | Verified WebSite, WebApplication, Offer, and breadcrumb JSON-LD. |
| `components/tool-supporting-content.tsx` | Verified registry-specific usage guidance, input/output expectations, privacy limitations, migration caveats, and same-category internal links across every tool route. |
| `components/page-view-tracker.tsx`, `components/service-worker-register.tsx` | Verified feature-gated, privacy-safe analytics and production-only service worker registration. |

## Core libraries

| File | Result |
| --- | --- |
| `lib/vcard.ts` | Verified the canonical parser/serializer, recovery warnings, encodings, escapes, parameters, structured values, photos, versions, and UTF-8 folding. |
| `lib/vcard-worker.ts` | Verified private worker protocol, progress, error result, and transferable buffers. |
| `lib/file-guard.ts` | Verified extension/type hints, byte limits, warning thresholds, and content sniffing. |
| `lib/tabular.ts`, `lib/xlsx.ts` | Verified formula-safe CSV, phone-preserving text XLSX cells, ZIP/XML workbook generation, BIFF8 signature detection and data-only import, shared strings, cached formulas, merged-cell warnings, and mapping. |
| `lib/sqlite.ts` | Verified normalized schema, transactions, real SQLite signature, project-schema import, and conservative generic-table mapping. |
| `lib/pdf.ts` | Verified valid PDF generation, pagination, card layout, page numbering, and embedded Latin-extended, Cyrillic, Greek, Devanagari, and Vietnamese font runs with safe fallback. |
| `lib/photos.ts` | Verified base64 decoding, size caps, image signatures, safe filenames, and remote-photo refusal. |
| `lib/fuzzy.ts` | Verified bounded blocking, deduplicated comparisons, explainable scoring, thresholding, and cap reporting. |
| `lib/contact-tools.ts` | Verified normalization, exact duplicate signals, cleaning, filtering, sorting, redaction, extraction, grouping, scoring, and type changes. |
| `lib/standards.ts`, `lib/vcard-text-tools.ts` | Verified jCard/xCard/JSContact/LDIF transforms, line tools, and synthetic fixture generation. |
| `lib/qr.ts` | Verified standards-valid UTF-8 QR matrix/SVG generation and payload handling through ZXing. |
| `lib/tools-registry.ts`, `lib/content-registry.ts` | Verified complete README route catalogue, formats, unique descriptions, platform guidance, statuses, and related content. |
| `lib/analytics.ts`, `lib/feature-flags.ts`, `lib/release.ts`, `lib/site-config.ts` | Verified no-contact-data event properties, defaults-off flags, release metadata, canonical/preview behavior. |

## Verification files

| File or group | Result |
| --- | --- |
| `tests/vcard.test.ts`, `standards.test.ts`, `compatibility.test.ts` | Verified golden parsing, version/format transformations, unknown-field preservation, and compatibility signals. |
| `tests/tabular.test.ts`, `legacy-xls.test.ts`, `advanced-formats.test.ts` | Verified CSV/XLSX mapping safety, generated BIFF8 XLS import, real SQLite, and embedded-font PDF signatures/round trips. |
| `tests/contact-tools.test.ts`, `contact-tools-expansion.test.ts` | Verified cleanup, duplicate, split, extraction, reporting, and transformation behaviors. |
| `tests/file-guard.test.ts`, `qr.test.ts`, `vcard-text-tools.test.ts` | Verified size refusal, QR correctness, folding, and synthetic generation. |
| `tests/seo.test.ts`, `launch.test.ts`, `analytics.test.ts` | Verified canonical metadata/sitemaps, route catalogue coverage, and private analytics payloads. |
| `tests/performance/benchmark.test.ts` | Verified 2,000-contact parse/serialize baseline inside the configured local budget. |
| `tests/e2e/core.spec.ts` | Verified homepage/editor and VCF-to-CSV flows, downloads, every registered production tool route, offline QR decode, desktop/mobile overflow, and serious/critical axe findings across representative pages. |
| `tests/fixtures/*` | Verified clean version fixtures, Unicode, quoted-printable, malformed, mixed-version, duplicate, hostile, and extension cases. |

## Remaining non-code evidence

See `IMPLEMENTATION_AUDIT.md`. No repository file can truthfully substitute for production DNS/search accounts, legal approval, advertising approval, real-device compatibility records, user validation, or post-launch business metrics.
