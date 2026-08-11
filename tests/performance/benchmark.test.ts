import { describe, expect, it } from "vitest";
import { parseVCard, serializeVCards } from "../../lib/vcard";

describe("parser performance baseline", () => {
  it("parses and serializes 2,000 simple contacts within the local budget", () => {
    const source = Array.from({ length: 2000 }, (_, index) => `BEGIN:VCARD\nVERSION:3.0\nN:Contact${index};Test;;;\nFN:Test Contact ${index}\nTEL:+234 801 ${String(index).padStart(4, "0")}\nEMAIL:contact${index}@example.com\nEND:VCARD`).join("\n");
    const start = performance.now();
    const parsed = parseVCard(source);
    const output = serializeVCards(parsed.contacts);
    const elapsed = performance.now() - start;
    console.info(`vCard benchmark: ${parsed.contacts.length} contacts in ${elapsed.toFixed(1)}ms, output ${(output.length / 1024).toFixed(1)}KB`);
    expect(parsed.contacts).toHaveLength(2000);
    expect(elapsed).toBeLessThan(5000);
  });
});
