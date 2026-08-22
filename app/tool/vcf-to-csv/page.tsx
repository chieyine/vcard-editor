import ConversionWorkspace from "../../../components/conversion-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF to CSV — vCard Editor", description: "Convert a VCF contact file to CSV locally in your browser.", path: "/tool/vcf-to-csv" });

export default function VcfToCsvPage() { const description = "Turn contact cards into spreadsheet rows with local processing and CSV injection protection."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONVERT</p><h1>VCF to CSV</h1><p>{description}</p></div><ConversionWorkspace mode="vcf-to-csv" /><ToolSupportingContent slug="vcf-to-csv" /></section><SiteFooter /><ToolStructuredData name="VCF to CSV" description={description} path="/tool/vcf-to-csv" /></main>; }
