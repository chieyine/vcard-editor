import { describe, expect, it } from "vitest";
import { guardFile, LARGE_FILE_BYTES, MAX_FILE_BYTES } from "../lib/file-guard";

describe("file safety guards", () => {
  it("rejects unsupported extensions", () => {
    expect(guardFile(new File(["hello"], "contacts.html"), [".vcf"])).toMatchObject({ ok: false });
  });

  it("warns on large files and refuses oversized files", () => {
    expect(guardFile(new File([new Uint8Array(LARGE_FILE_BYTES + 1)], "contacts.vcf"), [".vcf"])).toMatchObject({ ok: true, warning: expect.any(String) });
    expect(guardFile(new File([new Uint8Array(MAX_FILE_BYTES + 1)], "contacts.vcf"), [".vcf"])).toMatchObject({ ok: false });
  });
});
