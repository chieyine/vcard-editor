import BulkVCardCreator from "../../../components/bulk-vcard-creator";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";

import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Bulk vCard Creator — vCard Editor", description: "Create multiple vCards from a CSV or TSV locally in your browser.", path: "/tool/bulk-vcard-creator" });

export default function BulkVCardCreatorPage() { const description = "Create multiple vCards from a CSV or TSV locally in your browser."; return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">CREATE & SHARE</p><h1>Bulk vCard Creator</h1><p>{description}</p></div><BulkVCardCreator /><ToolSupportingContent slug="bulk-vcard-creator" /></section><SiteFooter /><ToolStructuredData name="Bulk vCard Creator" description={description} path="/tool/bulk-vcard-creator" /></main>; }
