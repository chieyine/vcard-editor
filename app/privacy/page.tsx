import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Privacy — vCard Editor", description: "How vCard Editor handles contact files and local browser data.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <InfoPage eyebrow="PRIVACY" title="Your contacts should stay yours." intro="The product is being built around a simple boundary: contact-file contents are processed locally in your browser whenever the tool supports it."><h2>Local processing</h2><p>When you use the editor, the selected file is read by your browser. The current editor does not upload contact contents to our application server.</p><h2>Minimal data collection</h2><p>We do not need an account or cloud project to edit a VCF. Optional product analytics, when introduced, should measure tool usage without recording contact values or file contents.</p><h2>Be careful with shared devices</h2><p>Downloads and browser memory are still local device data. Clear downloaded files and close the browser tab when working on a shared computer.</p></InfoPage>;
}
