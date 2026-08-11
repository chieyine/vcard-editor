import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Cookies — vCard Editor", description: "Cookie and local-storage information for vCard Editor.", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return <InfoPage eyebrow="COOKIES" title="A small browser footprint." intro="The core editor does not require an account or a cookie to open and export a VCF file."><h2>Essential storage</h2><p>Future preferences or recovery drafts may use browser storage only when the feature is clearly explained and can be cleared by the user.</p><h2>Third-party services</h2><p>Advertising and optional measurement will be introduced only after the privacy and quality requirements are ready. The contact-processing surface should remain isolated from unnecessary third-party scripts.</p></InfoPage>;
}
