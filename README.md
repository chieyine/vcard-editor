# vCard Editor

Private, browser-local tools for opening, editing, converting, cleaning, validating, and repairing VCF/vCard contact files.

## Quick start

Use Node 24 (also declared in `.node-version` and `package.json`).

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Files are processed in the browser; the core tools do not upload contact-file contents to an application server.

## What is included

- vCard editor with worker parsing, search, repeatable phone/email fields, raw view, validation, undo/redo, bulk cleanup, selected export, version conversion, and change reports.
- CSV, TSV, Excel, JSON, JSContact, jCard, xCard, LDIF, PDF, SQLite, HTML, text, QR, merge, split, duplicate, repair, extraction, and privacy-redaction workflows.
- 96 canonical registry-backed tools plus two permanent legacy redirects, 51 guides, detailed format references, platform workflows, local samples, accessibility checks, and SEO metadata.
- Local-first privacy boundary, size guards, safe text rendering, spreadsheet formula protection, security headers, preview `noindex`, and an offline shell.

## Current implementation limits

The [2026-09-27 implementation record](./IMPLEMENTATION_AUDIT.md) maps the changes to all 18 audit findings. Ordinary vCard operations retain ordered source properties and untouched blocks. The simple editor exposes the first address, organization and website; Raw view exposes every property.

Standards converters remain beta, with a documented subset and loss notices. Spreadsheet imports support common data cells and selected number/date formats, not full Excel rendering. Unsupported PDF glyphs stop export with an HTML alternative. Fuzzy matching reports its candidate limits. Keep original files and review outputs; no external-address-book compatibility certification is claimed.

Drafts stay in tab memory across internal navigation and are cleared by Open another, reload or closing the tab. No contact drafts are persisted to browser storage. Full page navigation requires a connection; the offline fallback does not reopen the app. Already-open local tools can continue processing their loaded resources.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The browser smoke suite is available with `npm run test:e2e` after installing the Playwright browsers.

## Documentation

The product requirements and roadmap are maintained in [VCARDEDITOR_MASTER_README.md](./VCARDEDITOR_MASTER_README.md). Supporting implementation, security, privacy, compatibility, deployment, and launch notes are listed in [IMPLEMENTATION_AUDIT.md](./IMPLEMENTATION_AUDIT.md), [SECURITY.md](./SECURITY.md), [PRIVACY_ARCHITECTURE.md](./PRIVACY_ARCHITECTURE.md), and [DEPLOYMENT.md](./DEPLOYMENT.md).

## Privacy reminder

Only process contact files you are authorised to use. Keep the original backup, review every generated output, and do not paste real contact data into bug reports.

Support: [support@vcardeditor.com](mailto:support@vcardeditor.com). Use synthetic data in reports.
