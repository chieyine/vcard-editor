import VcfCompareWorkspace from "../../../components/vcf-compare-workspace";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolSupportingContent from "../../../components/tool-supporting-content";
export const metadata = { title: "Compare VCF Files — vCard Editor", description: "Compare two contact backups locally and report added and removed contacts.", alternates: { canonical: "/tool/compare-vcf-files" } };
export default function Page() { return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">COMPARE & ORGANISE</p><h1>Compare VCF Files</h1><p>Choose two synthetic or private backups to see which contact records were added or removed.</p></div><VcfCompareWorkspace /><ToolSupportingContent slug="compare-vcf-files" /></section><SiteFooter /><ToolStructuredData name="Compare VCF Files" description={metadata.description} path="/tool/compare-vcf-files" /></main>; }
