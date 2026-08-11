import { InfoPage } from "../../components/site-chrome";
import { release } from "../../lib/release";

export const metadata = { title: "Changelog — vCard Editor", description: "Product updates for vCard Editor.", alternates: { canonical: "/changelog" } };

export default function ChangelogPage() {
  return <InfoPage eyebrow="CHANGELOG" title="A product built in public, one useful step at a time." intro={`Release ${release.version} · ${release.date} · ${release.channel}`}><h2>Foundation and launch controls</h2><p>Added the Next.js application shell, local VCF editor, conversion and cleanup tools, compatibility fixtures, accessibility foundations, SEO content, preview noindex protection, privacy-safe analytics hooks, and deployment checklists.</p><h2>Format and browser hardening</h2><p>Added data-only legacy Excel import, embedded international fonts for PDF contact directories, interoperable ZXing QR generation, and an offline QR decoder fallback for browsers without a native detector.</p><p>Expanded production verification to request every registered tool route and round-trip a generated QR image without a browser detector. Analytics and advertising remain disabled by default while the product is measured and reviewed.</p></InfoPage>;
}
