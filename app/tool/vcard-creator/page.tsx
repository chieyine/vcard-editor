import VCardCreator from "../../../components/vcard-creator";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "vCard Creator — vCard Editor", description: "Create one compatible contact card and download a VCF locally.", path: "/tool/vcard-creator" });
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>Create a vCard</h1><p>Enter a contact, preview the escaped vCard text, and download a compatible file locally.</p></div><VCardCreator /><ToolSupportingContent slug="vcard-creator" /></section><SiteFooter /><ToolStructuredData name="vCard Creator" description={"Create one compatible contact card and download a VCF locally."} path="/tool/vcard-creator" /></main>; }
