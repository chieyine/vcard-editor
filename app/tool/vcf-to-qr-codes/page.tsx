import VCardQrWorkspace from "../../../components/vcard-qr-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF to QR Codes — vCard Editor", description: "Generate one local QR SVG per vCard contact in a ZIP.", path: "/tool/vcf-to-qr-codes" });
export default function VcfToQrCodesPage() { const description = "Generate one local QR SVG per vCard contact in a ZIP."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>VCF to QR Codes</h1><p>{description}</p></div><VCardQrWorkspace mode="batch" /><ToolSupportingContent slug="vcf-to-qr-codes" /></section><SiteFooter /><ToolStructuredData name="VCF to QR Codes" description={description} path="/tool/vcf-to-qr-codes" /></main>; }
