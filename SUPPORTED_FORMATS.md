# Conversion boundaries

Updated 2026-09-27. These are implementation boundaries, not destination certification. Each converter shows a preview and loss notes; retain the original file.

| Format | Supported representation | Limits |
| --- | --- | --- |
| Ordinary vCard | Ordered properties, groups, parameters, repeated fields and original blocks. The form patches edited fields; selection/reordering retain unchanged blocks. | The form exposes the first scalar occurrence; use Raw view for additional addresses/websites/organizations. Version conversion rewrites syntax and reports known losses. Invalid source lines cannot always survive edits. |
| JSON | The named contact fields shown in the mapper, including phone/email lists. | Application-specific schema; no groups, parameters or repeated scalar occurrences. |
| JSContact | RFC 9553 version 1.0 Card: uid, name.full/components, phones.number, emails.address, organizations, titles, notes and keywords. | Batch array of Cards; no addresses, photos, localizations or vendor extensions. Missing UIDs receive new UUIDs. Extra scalar occurrences/parameters are not retained. |
| jCard | RFC 7095 property arrays; structured N/ADR/ORG, text lists, group parameter, string parameters and extended dates. | Batch array of jCards. FN/N/ADR/ORG/TEL/EMAIL/TITLE/NOTE/UID/CATEGORIES/NICKNAME/ROLE/URL/BDAY/PHOTO/PRODID subset; unsupported properties are disclosed on export and refused on import. |
| xCard | RFC 6351 namespace, structured name/address children, parameter elements and groups; local XML parsing rejects DTD/entities. | Same property subset as jCard. Non-URI UIDs are omitted with a notice. No arbitrary foreign XML elements. |
| LDIF | Names, UID, phone/email lists, first organization/title and notes, with base64/folding and escaped DN components. | Other LDAP attributes/object schemas are not mapped. A UID is generated for the DN when absent. |
| CSV / TSV | Explicit column mapping, repeated phone/email columns, duplicate-header handling and scalar-conflict refusal. | Safe exports visibly prefix formula-like text with apostrophes. Raw export is opt-in; import does not guess which apostrophes are protection. |
| XLSX / XLS | Selectable sheet, text/cached values, basic zero-padding and common date formats. Typed text cells on export. | No formula/macro execution. Unsupported formats retain raw values with warnings; merged cells retain the top-left value. Export previews show protection prefixes. XLS is data-only. |
| SQLite | Validated direct schema or explicit fallback-table mapping. | Up to 10,000 contacts/rows and bounded related rows; unsupported fields are disclosed. |
| PDF / HTML | Contact summary with wrapped, paginated detail lines and Unicode font coverage checks. | PDF stops on unsupported glyphs and offers HTML. The on-page contact summary is not a PDF-page preview. |

Specialist text conversions accept up to 5 MB and 10,000 records. Spreadsheet grids allow 50,000 data rows and 256 columns; XLSX expansion is capped at 64 MB. The main editor accepts at most 25 MB, 50,000 contacts and 500,000 property lines. QR batches accept 1 MB/200 contacts. Images are capped at 8 MB, 16 megapixels and 8,192 pixels per side; previews additionally share a total pixel budget. Smaller tool-specific limits are shown when applicable.

References: [JSContact, RFC 9553](https://www.rfc-editor.org/rfc/rfc9553.html), [jCard, RFC 7095](https://www.rfc-editor.org/rfc/rfc7095.html), [xCard, RFC 6351](https://www.rfc-editor.org/rfc/rfc6351.html). Independent standards examples were inspected as source; schemas and receiving applications were not executed during this implementation.
