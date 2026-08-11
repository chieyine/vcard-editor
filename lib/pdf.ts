import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { Contact } from "./vcard";

export type PdfFontSources = { regular: ArrayBuffer[]; bold: ArrayBuffer[] };

function supports(font: PDFFont, value: string) {
  try { font.encodeText(value); return true; } catch { return false; }
}

function fontFor(fonts: PDFFont[], value: string) {
  return fonts.find((font) => supports(font, value)) ?? fonts[fonts.length - 1];
}

function safeCharacter(font: PDFFont, value: string) {
  return supports(font, value) ? value : "?";
}

function textRuns(fonts: PDFFont[], value: string) {
  const runs: { font: PDFFont; text: string }[] = [];
  for (const character of value) {
    const font = fontFor(fonts, character);
    const text = safeCharacter(font, character);
    const previous = runs[runs.length - 1];
    if (previous?.font === font) previous.text += text;
    else runs.push({ font, text });
  }
  return runs;
}

function textWidth(fonts: PDFFont[], value: string, size: number) {
  return textRuns(fonts, value).reduce((width, run) => width + run.font.widthOfTextAtSize(run.text, size), 0);
}

function drawText(page: PDFPage, fonts: PDFFont[], value: string, options: { x: number; y: number; size: number; color: ReturnType<typeof rgb> }) {
  let x = options.x;
  textRuns(fonts, value).forEach((run) => {
    page.drawText(run.text, { ...options, x, font: run.font });
    x += run.font.widthOfTextAtSize(run.text, options.size);
  });
}

function contactLabel(contact: Contact) {
  return contact.formattedName || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unnamed contact";
}

function wrap(fonts: PDFFont[], value: string, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of value.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) { lines.push(""); continue; }
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && textWidth(fonts, candidate, size) > width) { lines.push(line); line = word; }
      else line = candidate;
    });
    if (line) lines.push(line);
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
    for (const bytes of sources.regular) regular.push(await document.embedFont(bytes, { subset: false }));
    for (const bytes of sources.bold) bold.push(await document.embedFont(bytes, { subset: false }));
  }
  regular.push(await document.embedFont(StandardFonts.Helvetica));
  bold.push(await document.embedFont(StandardFonts.HelveticaBold));
  return { regular, bold };
}

export async function contactsToPdf(contacts: Contact[], fontSources?: PdfFontSources) {
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
    drawText(page, bold, "vCard Editor", { x: margin, y, size: 9, color: rgb(0.08, 0.38, 0.28) });
    drawText(page, bold, `Contact directory · ${contacts.length.toLocaleString()} contacts`, { x: margin, y: y - 25, size: 20, color: rgb(0.08, 0.12, 0.1) });
    y -= 54;
  };
  const ensureSpace = (height: number) => {
    if (y - height < margin + 24) { addPage(); drawHeader(); }
  };

  drawHeader();
  contacts.forEach((contact, index) => {
    const details = [
      contact.organisation && [contact.organisation, contact.title].filter(Boolean).join(" · "),
      ...contact.phones.map((phone) => `Phone: ${phone}`),
      ...contact.emails.map((email) => `Email: ${email}`),
      contact.address && `Address: ${contact.address.replace(/;/g, ", ")}`,
      contact.url && `Website: ${contact.url}`,
      contact.note && `Note: ${contact.note}`,
    ].filter((value): value is string => Boolean(value));
    const detailLines = details.flatMap((value) => wrap(regular, value, 9.5, contentWidth - 24));
    const height = 40 + Math.max(1, detailLines.length) * 13;
    ensureSpace(height);
    page.drawRectangle({ x: margin, y: y - height + 8, width: contentWidth, height, color: index % 2 ? rgb(0.965, 0.98, 0.972) : rgb(0.985, 0.99, 0.987), borderColor: rgb(0.84, 0.89, 0.86), borderWidth: 0.6 });
    drawText(page, bold, contactLabel(contact), { x: margin + 12, y: y - 13, size: 12, color: rgb(0.08, 0.12, 0.1) });
    let lineY = y - 31;
    (detailLines.length ? detailLines : ["No additional contact details"]).forEach((line) => {
      drawText(page, regular, line, { x: margin + 12, y: lineY, size: 9.5, color: rgb(0.25, 0.31, 0.28) });
      lineY -= 13;
    });
    y -= height + 9;
  });

  document.getPages().forEach((outputPage, index) => {
    drawText(outputPage, regular, `Generated locally · Page ${index + 1} of ${pageNumber}`, { x: margin, y: 28, size: 8, color: rgb(0.4, 0.45, 0.42) });
  });
  return document.save();
}
