import "regenerator-runtime/runtime";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { Contact } from "./vcard";

export type PdfFontSources = { regular: ArrayBuffer[]; bold: ArrayBuffer[] };

const coverage = new WeakMap<PDFFont, Set<number>>();
function supports(font: PDFFont, value: string) {
  let characters = coverage.get(font);
  if (!characters) {
    characters = new Set(font.getCharacterSet());
    coverage.set(font, characters);
  }
  return [...value].every((character) =>
    characters!.has(character.codePointAt(0)!),
  );
}
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
function textRuns(fonts: PDFFont[], value: string) {
  const runs: { font: PDFFont; text: string }[] = [];
  // Prefer one font for each word so shaping is not split across its letters.
  for (const word of value.match(/\S+|\s+/gu) ?? []) {
    const wholeFont = fonts.find((font) => supports(font, word));
    const segments = wholeFont
      ? [word]
      : [...segmenter.segment(word)].map((part) => part.segment);
    for (const segment of segments) {
      const font =
        wholeFont ?? fonts.find((candidate) => supports(candidate, segment));
      if (!font)
        throw new Error(
          `The PDF fonts cannot render ${[...segment].map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase()}`).join(" ")}. Export HTML instead to use your device's fonts.`,
        );
      const previous = runs.at(-1);
      if (previous?.font === font) previous.text += segment;
      else runs.push({ font, text: segment });
    }
  }
  return runs;
}

function textWidth(fonts: PDFFont[], value: string, size: number) {
  return textRuns(fonts, value).reduce(
    (width, run) => width + run.font.widthOfTextAtSize(run.text, size),
    0,
  );
}

function drawText(
  page: PDFPage,
  fonts: PDFFont[],
  value: string,
  options: {
    x: number;
    y: number;
    size: number;
    color: ReturnType<typeof rgb>;
  },
) {
  let x = options.x;
  textRuns(fonts, value).forEach((run) => {
    page.drawText(run.text, { ...options, x, font: run.font });
    x += run.font.widthOfTextAtSize(run.text, options.size);
  });
}

function contactLabel(contact: Contact) {
  return (
    contact.formattedName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Unnamed contact"
  );
}

function wrap(fonts: PDFFont[], value: string, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of value.split(/\r\n|\r|\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/u).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(fonts, candidate, size) <= width) {
        line = candidate;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      for (const { segment } of segmenter.segment(word)) {
        if (line && textWidth(fonts, line + segment, size) > width) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
    }
    lines.push(line);
  }
  return lines;
}

async function embedFonts(document: PDFDocument, sources?: PdfFontSources) {
  const regular: PDFFont[] = [];
  const bold: PDFFont[] = [];
  if (sources?.regular.length && sources.bold.length) {
    document.registerFontkit(fontkit);
    // Fontkit's WOFF2 subset encoder can corrupt some complex-script tables.
    // Embedding the already-subset Fontsource files intact is deterministic and
    // still keeps the complete font payload below one megabyte.
    for (const bytes of sources.regular)
      regular.push(await document.embedFont(bytes, { subset: false }));
    for (const bytes of sources.bold)
      bold.push(await document.embedFont(bytes, { subset: false }));
  }
  regular.push(await document.embedFont(StandardFonts.Helvetica));
  bold.push(await document.embedFont(StandardFonts.HelveticaBold));
  return { regular, bold };
}

export async function contactsToPdf(
  contacts: Contact[],
  fontSources?: PdfFontSources,
  signal?: AbortSignal,
) {
  if (contacts.length > 5000)
    throw new Error("Create a PDF with at most 5,000 contacts at a time.");
  const textSize = contacts.reduce(
    (sum, contact) =>
      sum +
      [
        contactLabel(contact),
        contact.organisation,
        contact.title,
        ...contact.phones,
        ...contact.emails,
        contact.address,
        contact.url,
        contact.note,
      ].join("").length,
    0,
  );
  if (textSize > 2 * 1024 * 1024)
    throw new Error(
      "The directory contains too much text. Split it before creating a PDF.",
    );
  signal?.throwIfAborted();
  const document = await PDFDocument.create();
  document.setTitle("Contact directory");
  document.setAuthor("vCard Editor");
  document.setSubject("Locally generated contact directory");
  document.setCreator("vCard Editor");
  const { regular, bold } = await embedFonts(document, fontSources);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  let page = document.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let pageNumber = 1;

  const addPage = () => {
    page = document.addPage([pageWidth, pageHeight]);
    pageNumber += 1;
    y = pageHeight - margin;
  };
  const drawHeader = () => {
    drawText(page, bold, "vCard Editor", {
      x: margin,
      y,
      size: 9,
      color: rgb(0.08, 0.38, 0.28),
    });
    drawText(
      page,
      bold,
      `Contact directory · ${contacts.length.toLocaleString()} contacts`,
      { x: margin, y: y - 25, size: 20, color: rgb(0.08, 0.12, 0.1) },
    );
    y -= 54;
  };
  const ensureSpace = (height: number) => {
    if (y - height < margin + 24) {
      addPage();
      drawHeader();
    }
  };

  drawHeader();
  for (const [index, contact] of contacts.entries()) {
    if (index % 8 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      signal?.throwIfAborted();
    }
    const details = [
      contact.organisation &&
        [contact.organisation, contact.title].filter(Boolean).join(" · "),
      ...contact.phones.map((phone) => `Phone: ${phone}`),
      ...contact.emails.map((email) => `Email: ${email}`),
      contact.address && `Address: ${contact.address.replace(/;/g, ", ")}`,
      contact.url && `Website: ${contact.url}`,
      contact.note && `Note: ${contact.note}`,
    ].filter((value): value is string => Boolean(value));
    const detailLines = details.flatMap((value) =>
      wrap(regular, value, 9.5, contentWidth - 24),
    );
    const nameLines = wrap(bold, contactLabel(contact), 12, contentWidth - 24);
    ensureSpace(42);
    const lines = [
      ...nameLines.map((text) => ({ text, fonts: bold, size: 12, height: 17 })),
      ...(detailLines.length
        ? detailLines
        : ["No additional contact details"]
      ).map((text) => ({ text, fonts: regular, size: 9.5, height: 13 })),
    ];
    for (const [lineIndex, line] of lines.entries()) {
      if (lineIndex % 100 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        signal?.throwIfAborted();
      }
      ensureSpace(line.height + 5);
      drawText(page, line.fonts, line.text, {
        x: margin + 12,
        y: y - line.height,
        size: line.size,
        color: rgb(0.12, 0.18, 0.15),
      });
      y -= line.height;
    }
    y -= 16;
  }

  document.getPages().forEach((outputPage, index) => {
    drawText(
      outputPage,
      regular,
      `Generated locally · Page ${index + 1} of ${pageNumber}`,
      { x: margin, y: 28, size: 8, color: rgb(0.4, 0.45, 0.42) },
    );
  });
  signal?.throwIfAborted();
  return document.save();
}
