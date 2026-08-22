import VCardQrWorkspace from "../../../components/vcard-qr-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "vCard QR Code Generator — vCard Editor", description: "Generate a QR code locally from a vCard contact.", path: "/tool/vcard-qr-code" });
export default function VCardQrCodePage() { const description = "Generate a QR code locally from a vCard contact."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>vCard QR Code Generator</h1><p>{description}</p></div><VCardQrWorkspace mode="single" /><ToolSupportingContent slug="vcard-qr-code" /></section><SiteFooter /><ToolStructuredData name="vCard QR Code Generator" description={description} path="/tool/vcard-qr-code" /></main>; }
