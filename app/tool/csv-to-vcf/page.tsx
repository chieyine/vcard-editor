import ConversionWorkspace from "../../../components/conversion-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "CSV to VCF — vCard Editor", description: "Map CSV columns to contact fields and create a VCF file locally.", path: "/tool/csv-to-vcf" });

export default function CsvToVcfPage() { const description = "Map spreadsheet columns to contact fields, preview the result, and download an importable vCard."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONVERT</p><h1>CSV to VCF</h1><p>{description}</p></div><ConversionWorkspace mode="csv-to-vcf" /><ToolSupportingContent slug="csv-to-vcf" /></section><SiteFooter /><ToolStructuredData name="CSV to VCF" description={description} path="/tool/csv-to-vcf" /></main>; }
