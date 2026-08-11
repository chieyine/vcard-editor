import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "How it works — vCard Editor", description: "Learn how vCard Editor processes contact files locally in your browser.", alternates: { canonical: "/how-it-works" } };

export default function HowItWorksPage() {
  return <InfoPage eyebrow="HOW IT WORKS" title="A local workspace for contact files." intro="vCard Editor is designed for the moment when a contact file needs attention, not another account or upload form."><h2>What happens when you choose a file?</h2><p>Your browser reads the file using the File API. The editor parses its vCard blocks, builds an editable contact model, and keeps the working data in the current browser tab.</p><h2>What leaves your device?</h2><p>The initial workspace does not send contact contents to an application server. Downloads are generated locally as a new file. We also avoid third-party analytics inside the processing surface.</p><h2>What should I expect?</h2><p>The first release focuses on common VCF files and transparent feedback. Unsupported or malformed lines should be surfaced as warnings rather than silently hidden.</p></InfoPage>;
}
