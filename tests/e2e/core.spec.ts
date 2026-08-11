import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import path from "node:path";
import { qrToSvg } from "../../lib/qr";
import { tools } from "../../lib/tools-registry";

const fixture = path.join(process.cwd(), "tests/fixtures/clean-3-0.vcf");

test("homepage and flagship editor complete the sample flow", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/vCard Editor/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Edit, convert, and clean");
  await page.getByRole("button", { name: "Try a sample file" }).first().click();
  await expect(page.getByText(/2 contacts ready/i)).toBeVisible({ timeout: 15000 });
  await page.getByLabel(/Search names/i).fill("Ada");
  await expect(page.getByText("Ada Okafor").first()).toBeVisible();
  const editorAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const editorBlocking = editorAxe.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  expect(editorBlocking, editorBlocking.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
  const editorOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(editorOverflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("VCF to CSV accepts a fixture and offers a download", async ({ page }) => {
  await page.goto("/tool/vcf-to-csv", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Choose VCF or vCard").setInputFiles(fixture);
  await expect(page.getByRole("heading", { name: /contacts ready/i })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
});

test("every registered tool page renders its own production content", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "the catalogue contract needs one production browser engine");
  for (let index = 0; index < tools.length; index += 12) {
    await Promise.all(tools.slice(index, index + 12).map(async (tool) => {
      const response = await request.get(`/tool/${tool.slug}`);
      expect(response.status(), tool.slug).toBe(200);
      const html = await response.text();
      expect(html.toLowerCase(), tool.slug).toContain(tool.name.toLowerCase());
      expect(html.toLowerCase(), tool.slug).toContain("how to use");
    }));
  }
});

test("QR images decode with the offline fallback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "fallback behavior is covered once; core QR rendering remains cross-browser");
  await page.addInitScript(() => { Object.defineProperty(window, "BarcodeDetector", { value: undefined, configurable: true }); });
  const payload = "BEGIN:VCARD\nVERSION:3.0\nFN:Ada QR\nTEL:+2348012345678\nEND:VCARD";
  await page.goto("/tool/qr-code-to-vcard");
  await page.getByLabel("Choose QR image").setInputFiles({ name: "contact-qr.svg", mimeType: "image/svg+xml", buffer: Buffer.from(qrToSvg(payload, 10)) });
  await expect(page.getByText("vCard QR detected")).toBeVisible({ timeout: 15000 });
  await expect(page.getByLabel("Decoded payload")).toContainText("FN:Ada QR");
});

for (const route of ["/", "/tools", "/tool/vcf-editor", "/tool/vcf-to-csv", "/privacy"]) {
  test(`@a11y ${route} has no serious automated accessibility violations`, async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("chromium"), "axe is run in both Chromium viewport profiles; core flows cover every engine");
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
    expect(blocking, blocking.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
