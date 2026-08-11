"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tools } from "../lib/tools-registry";

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => { const normalized = query.trim().toLowerCase(); if (!normalized) return tools; return tools.filter((tool) => `${tool.name} ${tool.slug} ${tool.category} ${tool.description}`.toLowerCase().includes(normalized)); }, [query]);
  return <section className="tool-search" aria-labelledby="tool-search-heading"><div className="tool-search-heading"><p className="eyebrow">SEARCH TOOLS</p><h2 id="tool-search-heading">Find a contact-file job</h2></div><label className="tool-search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “duplicates”, “Excel”, or “JSON”" aria-label="Search tools" /></label><div className="tool-search-results" aria-live="polite">{matches.map((tool) => <Link href={`/tool/${tool.slug}`} key={tool.slug}><strong>{tool.name}</strong><small>{tool.description}</small></Link>)}{!matches.length && <p>No matching tools. Try a format or task word.</p>}</div></section>;
}

