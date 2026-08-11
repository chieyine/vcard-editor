import ConversionWorkspace from "../../../components/conversion-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

export const metadata = { title: "VCF to Excel — vCard Editor", description: "Convert VCF contacts to an Excel workbook locally in your browser.", alternates: { canonical: "/tool/vcf-to-excel" } };

export default function VcfToExcelPage() { const description = "Export contact cards as a clean .xlsx workbook without sending the source file to a server."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONVERT</p><h1>VCF to Excel</h1><p>{description}</p></div><ConversionWorkspace mode="vcf-to-xlsx" /><ToolSupportingContent slug="vcf-to-excel" /></section><SiteFooter /><ToolStructuredData name="VCF to Excel" description={description} path="/tool/vcf-to-excel" /></main>; }
