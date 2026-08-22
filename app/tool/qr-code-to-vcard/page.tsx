import QrCodeReaderWorkspace from "../../../components/qr-code-reader-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "QR Code to vCard — vCard Editor", description: "Decode a selected QR image locally and export a vCard when it contains one.", path: "/tool/qr-code-to-vcard" });
export default function QrCodeToVcardPage() { const description = "Decode a selected QR image locally and export a vCard when it contains one."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>QR Code to vCard</h1><p>{description}</p></div><QrCodeReaderWorkspace /><ToolSupportingContent slug="qr-code-to-vcard" /></section><SiteFooter /><ToolStructuredData name="QR Code to vCard" description={description} path="/tool/qr-code-to-vcard" /></main>; }
