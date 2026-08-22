import { BarcodeFormat, EncodeHintType, QRCodeWriter } from "@zxing/library";

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

/** Encode a standards-valid QR matrix locally with no network dependency. */
export function encodeQr(value: string, errorCorrection: QrErrorCorrection = "L"): boolean[][] {
  if (!value.trim()) throw new Error("Enter contact details before creating a QR code.");
  const hints = new Map<EncodeHintType, string | number>();
  hints.set(EncodeHintType.CHARACTER_SET, "UTF-8");
  hints.set(EncodeHintType.ERROR_CORRECTION, errorCorrection);
  hints.set(EncodeHintType.MARGIN, 0);
  try {
    const matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, 0, 0, hints);
    return Array.from({ length: matrix.getHeight() }, (_, row) =>
      Array.from({ length: matrix.getWidth() }, (_, column) => matrix.get(column, row)),
    );
  } catch {
    throw new Error("This vCard is too long for a reliable QR code. Remove optional fields and try again.");
  }
}

export function qrToSvg(value: string, moduleSize = 5, margin = 4, errorCorrection: QrErrorCorrection = "L") {
  const matrix = encodeQr(value, errorCorrection);
  const size = matrix.length;
  const total = (size + margin * 2) * moduleSize;
  const modules = matrix.flatMap((row, rowIndex) => row.map((dark, columnIndex) => dark
    ? `<rect x="${(columnIndex + margin) * moduleSize}" y="${(rowIndex + margin) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`
    : "")).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${modules}</g></svg>`;
}
