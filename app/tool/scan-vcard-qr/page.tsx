import QrCodeReaderWorkspace from "../../../components/qr-code-reader-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
export const metadata = { title: "Scan a vCard QR — vCard Editor", description: "Scan a vCard QR code with explicit camera permission when your browser supports local detection.", alternates: { canonical: "/tool/scan-vcard-qr" } };
export default function ScanVcardQrPage() { const description = "Scan a vCard QR code with explicit camera permission when your browser supports local detection."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>Scan a vCard QR</h1><p>{description}</p></div><QrCodeReaderWorkspace camera /><ToolSupportingContent slug="scan-vcard-qr" /></section><SiteFooter /><ToolStructuredData name="Scan a vCard QR" description={description} path="/tool/scan-vcard-qr" /></main>; }
