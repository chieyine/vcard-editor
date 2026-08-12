import Link from "next/link";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import { tools } from "../../lib/tools-registry";
import ToolSearch from "../../components/tool-search";

export const metadata = { title: "Tools — vCard Editor", description: "Local-first tools for opening, converting, cleaning, and repairing contact files.", alternates: { canonical: "/tools" } };

const toolPath = (slug: string) => `/tool/${slug}`;

export default function ToolsPage() {
  return <main><SiteHeader /><section className="directory-page" id="content"><p className="eyebrow">THE TOOLBOX</p><h1>Contact-file tools, built around the job.</h1><p className="directory-intro">Every tool is designed to run in your browser. Search by task, format, or platform synonym.</p><ToolSearch /><div className="directory-grid">{tools.filter((tool) => tool.indexable).map((tool) => <Link className="directory-card" href={toolPath(tool.slug)} key={tool.slug}><span className="directory-card-top"><span className="job-number">{tool.category}</span><span className={`status status-${tool.status}`}>{tool.status}</span></span><strong>{tool.name}</strong><p>{tool.description}</p><span className="directory-card-bottom">{tool.inputFormats.length ? tool.inputFormats.join(" · ") : "Browser workspace"} <span aria-hidden="true">↗</span></span></Link>)}</div></section><SiteFooter /></main>;
}
