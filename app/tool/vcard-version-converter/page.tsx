import VCardTransformWorkspace from "../../../components/vcard-transform-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "vCard Version Converter — vCard Editor", description: "Convert vCard 2.1, 3.0, and 4.0 files locally with a change summary.", path: "/tool/vcard-version-converter" });
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CONVERT</p><h1>Convert vCard Versions</h1><p>Choose a target vCard version, review the conversion summary, and download a compatible copy.</p></div><VCardTransformWorkspace mode="version" /><ToolSupportingContent slug="vcard-version-converter" /></section><SiteFooter /><ToolStructuredData name="vCard Version Converter" description={"Convert vCard 2.1, 3.0, and 4.0 files locally with a change summary."} path="/tool/vcard-version-converter" /></main>; }
