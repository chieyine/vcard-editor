import ContactToolsWorkspace, { ContactToolMode } from "./contact-tools-workspace";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { ToolStructuredData } from "./structured-data";
import ToolSupportingContent from "./tool-supporting-content";

export function ContactToolPage({ mode, title, eyebrow, description }: { mode: ContactToolMode; title: string; eyebrow: string; description: string }) {
  const routeSlug = mode === "extract-phones" ? "extract-phone-numbers" : mode === "extract-emails" ? "extract-email-addresses" : mode === "normalize-phones" ? "normalize-phone-numbers" : mode === "remove-photos" ? "remove-vcf-photos" : mode === "dedupe" ? "remove-duplicate-contacts" : mode === "cleaner" ? "contact-cleaner" : mode === "validator" ? "vcf-validator" : mode === "merge" ? "merge-vcf" : mode === "split" ? "split-vcf" : mode === "repair" ? "vcf-repair" : mode;
  return <main><SiteHeader /><section className="tool-page" id="content"><div className="tool-page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><ContactToolsWorkspace mode={mode} /><ToolSupportingContent slug={routeSlug} /></section><SiteFooter /><ToolStructuredData name={title} description={description} path={`/tool/${routeSlug}`} /></main>;
}
