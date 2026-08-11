# Compatibility fixture corpus

These fixtures are synthetic and contain no private contact data. They cover the minimum launch corpus:

- clean vCard 2.1 with quoted-printable Unicode;
- clean vCard 3.0 with a long property and an unknown `X-` field;
- multiple cards with duplicate phone and email identities;
- an unfinished card with a missing boundary;
- hostile values for text rendering and CSV-injection tests.
- `clean-4-0.vcf`: vCard 4.0 URI-style phone fixture.
- `unicode.vcf`: multilingual and emoji values.
- `mixed-version.vcf`: one 2.1 card and one 4.0 card.
- `quoted-printable.vcf`: legacy UTF-8 quoted-printable values.
- `unknown-extensions.vcf`: vendor `X-` properties that must remain visible and preservable.

Vendor-derived exports may be added only after sanitization and confirmation that they can legally be committed. Each compatibility record should include the source application/version, test date, fields checked, and known limitations.
