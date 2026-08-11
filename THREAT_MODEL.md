# Threat model

## Assets

- contact names, phone numbers, email addresses, notes, photos, and unknown fields;
- browser memory and generated downloads;
- parser and conversion availability;
- user trust in the local-processing promise.

## Main threats

- malformed files causing parser errors or browser memory exhaustion;
- unsafe field rendering causing script injection;
- spreadsheet formula injection in CSV exports;
- expensive duplicate comparisons freezing the UI;
- dependency and supply-chain vulnerabilities;
- accidental contact values in logs or telemetry.

## Mitigations in the current implementation

- bounded file sizes with large-file warnings;
- worker-backed parsing for the main editor;
- text-only rendering of contact fields;
- no remote URL fetching from contact properties;
- CSV formula-trigger escaping;
- hashed/indexed duplicate matching rather than all-pairs comparison;
- strict response headers and a content-security policy;
- local-only downloads and contact-free status messages.

The model should be revisited before adding ads, analytics, cloud storage, accounts, or server-side processing.
