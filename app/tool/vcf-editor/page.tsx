import VCardEditor from "../../../components/vcard-editor";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

export const metadata = { title: "VCF Editor — vCard Editor", description: "Open, edit, and export a VCF contact file locally in your browser.", alternates: { canonical: "/tool/vcf-editor" } };

export default function VcfEditorPage() {
  return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">OPEN & EDIT</p><h1>VCF Editor</h1><p>Open a contact file, make the correction, and download a clean vCard. Your file stays in this browser.</p></div><VCardEditor /><ToolSupportingContent slug="vcf-editor" /></section><SiteFooter /><ToolStructuredData name="VCF Editor" description="Open, edit, validate, and export a VCF contact file locally in your browser." path="/tool/vcf-editor" /></main>;
}
