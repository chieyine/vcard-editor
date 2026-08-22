import VCardViewer from "../../../components/vcard-viewer";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF Viewer — vCard Editor", description: "Open and inspect a VCF file locally without changing the source.", path: "/tool/vcf-viewer" });
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">OPEN & INSPECT</p><h1>View a VCF File</h1><p>Inspect contacts, versions, warnings, and raw properties without changing the source file.</p></div><VCardViewer /><ToolSupportingContent slug="vcf-viewer" /></section><SiteFooter /><ToolStructuredData name="VCF Viewer" description={"Open and inspect a VCF file locally without changing the source."} path="/tool/vcf-viewer" /></main>; }
