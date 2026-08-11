import { describe, expect, it } from "vitest";
import { encodeQr, qrToSvg } from "../lib/qr";

describe("local QR encoder", () => {
  it("encodes short vCard payloads into a square matrix", () => {
    const matrix = encodeQr("BEGIN:VCARD\nVERSION:3.0\nFN:Ada\nEND:VCARD");
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
    expect(matrix[0][0]).toBe(true);
  });

  it("creates a self-contained SVG without external resources", () => {
    const svg = qrToSvg("hello");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("<rect");
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("href=");
  });
});
