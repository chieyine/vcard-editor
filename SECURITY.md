# Security

vCard Editor is designed to process contact files locally in the browser. The application does not intentionally send contact-file contents to its application server.

## Reporting a vulnerability

Email [support@vcardeditor.com](mailto:support@vcardeditor.com) to report a security issue. Include the affected route, a minimal reproduction using synthetic contact data, and the impact. Do not attach real contact files, phone numbers, email addresses, notes, or photos.

## Current safeguards

- file extensions and size are checked before processing;
- parsing happens in a worker where the workflow supports it;
- contact values are rendered as text, never as HTML;
- CSV exports escape formula-like values;
- generated ZIP files contain locally generated vCards, QR SVGs, reports or validated embedded image bytes;
- request nonces authorize scripts; security headers and a bounded content-security policy are configured;
- user contact values are not written to production logs.

This document describes the current development state and will be updated as new processors and third-party services are introduced.
