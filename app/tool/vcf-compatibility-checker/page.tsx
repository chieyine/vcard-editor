import VcfCompatibilityWorkspace from "../../../components/vcf-compatibility-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF Compatibility Checker — vCard Editor", description: "Run a conservative local compatibility report for Google, Apple, Outlook, or Android contact imports.", path: "/tool/vcf-compatibility-checker" });
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">COMPATIBILITY</p><h1>Check VCF Import Compatibility</h1><p>Review versions, warnings, photos, and unknown fields before a platform import.</p></div><VcfCompatibilityWorkspace /><ToolSupportingContent slug="vcf-compatibility-checker" /></section><SiteFooter /><ToolStructuredData name="VCF Compatibility Checker" description={"Run a conservative local compatibility report for Google, Apple, Outlook, or Android contact imports."} path="/tool/vcf-compatibility-checker" /></main>; }
