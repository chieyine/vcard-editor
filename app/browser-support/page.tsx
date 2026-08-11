import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Browser support — vCard Editor", description: "Browser support guidance for vCard Editor.", alternates: { canonical: "/browser-support" } };

export default function BrowserSupportPage() {
  return <InfoPage eyebrow="BROWSER SUPPORT" title="Use a current, capable browser." intro="The editor relies on modern browser file APIs and client-side JavaScript. Updated desktop browsers provide the best experience for large contact lists."><h2>Recommended</h2><p>Use the current version of Chrome, Edge, Firefox, or Safari on a supported desktop or laptop.</p><h2>Mobile devices</h2><p>Small files work well on modern phones. Large VCF files and embedded photos may need more memory than a mobile browser can comfortably provide.</p><h2>Before reporting a problem</h2><p>Try a current browser, a smaller copy of the file, and the synthetic sample. Include the browser name and a description of the file shape, but never send private contact data.</p></InfoPage>;
}
