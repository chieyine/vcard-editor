# Changelog

## Unreleased — 2026-09-27 audit implementation

- Addressed the code recommendations A01–A18: source-property preservation, standards subsets, field-specific cleanup, camera lifecycle, full comparison, redaction, spreadsheet/PDF limits, cancellation, editor drafts/history and accessible controls.
- Consolidated all tool routes into one registry and lazy workspace dispatcher; added real table viewing and output/change previews.
- Replaced global script hashes and private manifest mutation with per-request nonces. Removed analytics providers, generic word-count expansion and obsolete lint checks.
- Added Node 24 configuration, semantic linting, formatting and a real support destination.
- No tests, production build, browser flows or deployment checks were run for this implementation; see IMPLEMENTATION_AUDIT.md for static evidence and remaining verification.

The entries below describe historical work, including designs superseded by this audit. `package.json` is the current version source.

## 0.2.0 — 2026-08-21

- Fixed SQLite→VCF child-row mapping for databases with non-contiguous ids; guarded empty country-code removal; corrected escaped-backslash unescaping; deduplicated split-by-group ZIP names.
- Added Windows-1252 fallback decoding for legacy exports that are not valid UTF-8.
- Duplicate review now supports choosing the primary contact per group before merging or removing; merge mode supports appending more files to an open session and links to duplicate review when cross-file matches are found.
- Added structured address editing (street, city, region, postal, country), bulk find-and-replace across contact fields, strict validator mode, CSV/Excel export column selection, and a QR error-correction selector.
- Enforced a strict production CSP (`script-src 'self'` + build-time inline-script hashes) with Subresource Integrity; service worker now serves navigations network-first.
- Unified visible text on US English, neutral country-code defaults, dynamic footer year, keyboard shortcuts (⌘O open, ⌘Z undo, ⇧⌘Z redo) replacing decorative glyphs, and `/` to focus tool search.
- SEO: varied editorial expansion content per page, per-tool Open Graph images, 404 (instead of empty) sitemap on preview deployments.

## 0.1.0 — 2026-08-11

- Completed the Phase 0–6 foundation: local vCard editing, conversion, cleanup tools, validation, SEO content, accessibility foundations, and compatibility tests.
- Added Phase 7 launch controls: privacy-safe event taxonomy, preview noindex protection, release metadata, and deployment checklists.
- Added Phase 7 expansion converters for JSContact, jCard, xCard, and LDIF, plus an offline PWA shell.
- Analytics and advertising remain disabled by default.
