import Link from "next/link";
import { ContentPage } from "../lib/content-registry";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function ContentDirectory({ kind, title, intro, pages }: { kind: "guide" | "format" | "platform"; title: string; intro: string; pages: ContentPage[] }) {
  const label = kind === "guide" ? "Guides" : kind === "format" ? "Formats" : "Platform workflows";
  return <main><SiteHeader /><section className="content-directory" id="content"><p className="eyebrow">{label.toUpperCase()}</p><h1>{title}</h1><p className="directory-intro">{intro}</p><div className="content-directory-grid">{pages.map((page) => <Link className="content-directory-card" href={`/${kind}/${page.slug}`} key={page.slug}><span className="job-number">{page.lastReviewed}</span><strong>{page.title}</strong><p>{page.description}</p><span className="directory-card-bottom">Read {label.toLowerCase()} <span aria-hidden="true">↗</span></span></Link>)}</div></section><SiteFooter /></main>;
}
