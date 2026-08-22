import ConversionWorkspace from "../../../components/conversion-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Excel to VCF — vCard Editor", description: "Map an Excel contact sheet to a VCF file locally in your browser.", path: "/tool/excel-to-vcf" });

export default function ExcelToVcfPage() { const description = "Choose a workbook, map its columns, preview the contacts, and download a compatible vCard."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONVERT</p><h1>Excel to VCF</h1><p>{description}</p></div><ConversionWorkspace mode="xlsx-to-vcf" /><ToolSupportingContent slug="excel-to-vcf" /></section><SiteFooter /><ToolStructuredData name="Excel to VCF" description={description} path="/tool/excel-to-vcf" /></main>; }
