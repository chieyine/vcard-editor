import { describe, expect, it } from "vitest";
import { parseVCard, serializeVCards } from "../lib/vcard";

function random(seed: number) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 0x100000000);
}

describe("bounded parser fuzz safety", () => {
  it("never throws on deterministic malformed contact text", () => {
    const next = random(0x56434152);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789;:=,^'\\\r\n \u0000\u001f😀";
    for (let sample = 0; sample < 250; sample += 1) {
      const length = 20 + Math.floor(next() * 800);
      let input = sample % 3 === 0 ? "BEGIN:VCARD\r\nVERSION:3.0\r\n" : "";
      for (let index = 0; index < length; index += 1) input += alphabet[Math.floor(next() * alphabet.length)];
      if (sample % 2 === 0) input += "\r\nEND:VCARD";
      expect(() => {
        const parsed = parseVCard(input);
        if (parsed.contacts.length) serializeVCards(parsed.contacts, { version: "3.0" });
      }).not.toThrow();
    }
  });

  it("bounds pathological physical-line counts", () => {
    const lines = Array.from({ length: 20_000 }, (_, index) => `X-FUZZ-${index}:value`).join("\r\n");
    const result = parseVCard(`BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Fuzz\r\n${lines}\r\nEND:VCARD`);
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].formattedName).toBe("Fuzz");
  });
});
