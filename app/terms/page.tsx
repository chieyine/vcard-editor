import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Terms — vCard Editor", description: "Terms for using vCard Editor.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <InfoPage eyebrow="TERMS" title="Use the tools responsibly." intro="vCard Editor is a free utility for managing contact files you are allowed to access and transform."><h2>Your responsibility</h2><p>Only process files you have permission to use. Review outputs before importing them into another address book or sharing them.</p><h2>Availability</h2><p>The service is provided as-is while the product is being developed. Compatibility can vary by source application, vCard version, and file quality.</p></InfoPage>;
}
