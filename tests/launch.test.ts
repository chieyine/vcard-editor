import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("launch surface", () => {
  it("contains the required launch routes", () => {
    const routes = ["app/tool/vcf-editor/page.tsx", "app/tool/vcf-viewer/page.tsx", "app/tool/vcard-creator/page.tsx", "app/tool/bulk-vcard-creator/page.tsx", "app/tool/vcard-qr-code/page.tsx", "app/tool/vcf-to-qr-codes/page.tsx", "app/tool/qr-code-to-vcard/page.tsx", "app/tool/scan-vcard-qr/page.tsx", "app/tool/vcf-to-csv/page.tsx", "app/tool/csv-to-vcf/page.tsx", "app/tool/vcf-to-excel/page.tsx", "app/tool/excel-to-vcf/page.tsx", "app/tool/merge-vcf/page.tsx", "app/tool/split-vcf/page.tsx", "app/tool/remove-duplicate-contacts/page.tsx", "app/tool/vcf-validator/page.tsx", "app/tool/vcf-repair/page.tsx", "app/tool/vcard-version-converter/page.tsx", "app/tool/contact-cleaner/page.tsx", "app/tool/extract-phone-numbers/page.tsx", "app/tool/extract-email-addresses/page.tsx", "app/about/page.tsx", "app/author/page.tsx", "app/sitemap/page.tsx"];
    routes.forEach((route) => expect(existsSync(route), route).toBe(true));
  });
});
