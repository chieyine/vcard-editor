import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components/site-chrome";

export default function NotFound() {
  return <main><SiteHeader /><section className="not-found" id="content"><p className="eyebrow">404 · NOT FOUND</p><h1>That page is not here.</h1><p>Try the editor or browse the tools that are currently available.</p><div><Link className="primary-button" href="/tool/vcf-editor">Open editor</Link> <Link className="secondary-button" href="/tools">Browse tools</Link></div></section><SiteFooter /></main>;
}
