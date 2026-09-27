# Third-party notices

Runtime dependency inventory, checked against the installed package and lockfile metadata on 2026-09-27.

| Package | Locked version | Declared license |
| --- | --- | --- |
| @fontsource/noto-sans | 5.3.0 | OFL-1.1 |
| @pdf-lib/fontkit | 1.1.1 | MIT |
| @xmldom/xmldom | 0.9.12 | MIT |
| @vercel/analytics | 2.0.1 | MIT |
| @zxing/browser | 0.2.1 | MIT |
| @zxing/library | 0.23.0 | Apache-2.0 |
| fflate | 0.8.3 | MIT |
| hucre | 1.0.0 | MIT |
| next | 16.3.6 | MIT |
| pdf-lib | 1.17.1 | MIT |
| react | 19.2.8 | MIT |
| react-dom | 19.2.8 | MIT |
| sql.js | 1.14.1 | MIT |

SheetJS `xlsx` is not a current dependency. XLSX handling lives in `lib/xlsx.ts`; legacy XLS parsing uses `hucre`.

The bundled Noto Sans fonts are distributed under the [SIL Open Font License](./public/fonts/OFL.txt). Preserve upstream notices when redistributing dependencies. This inventory records declared licenses; it is not a complete transitive license or vulnerability audit. Exact dependency resolution is recorded in `package-lock.json`.

The PDF bundle includes Latin, Latin extended, Cyrillic, Cyrillic extended, Greek, Greek extended, Devanagari and Vietnamese regular/bold subsets under the same OFL notice. The analytics package is retained for the existing local scratch scripts; no provider is mounted by the application.
