import VCardTransformWorkspace from "../../../components/vcard-transform-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF Encoding Fixer — vCard Editor", description: "Repair common VCF byte-order mark, line-ending, quoted-printable, and structure problems locally.", path: "/tool/vcf-encoding-fixer" });
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">VALIDATE & REPAIR</p><h1>Fix VCF Encoding</h1><p>Normalize common encoding and structural problems while keeping the original file unchanged.</p></div><VCardTransformWorkspace mode="encoding" /><ToolSupportingContent slug="vcf-encoding-fixer" /></section><SiteFooter /><ToolStructuredData name="VCF Encoding Fixer" description={"Repair common VCF byte-order mark, line-ending, quoted-printable, and structure problems locally."} path="/tool/vcf-encoding-fixer" /></main>; }
