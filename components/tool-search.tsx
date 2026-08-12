"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tools } from "../lib/tools-registry";

const synonyms: Record<string, string> = {
  combine: "merge",
  join: "merge",
  separate: "split",
  divide: "split",
  phonebook: "contacts",
  phonebooks: "contacts",
  spreadsheet: "csv excel",
  phone: "tel telephone mobile cell",
  duplicate: "dedupe repeated matching",
  duplicates: "dedupe repeated matching",
  broken: "repair validate",
  corrupt: "repair validate",
  unsupported: "version compatibility",
  addressbook: "contacts vcard",
};

export default function ToolSearch() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => { const available = tools.filter((tool) => tool.indexable); const normalized = query.trim().toLowerCase(); if (!normalized) return available; const expanded = normalized.split(/\s+/).map((term) => synonyms[term] ?? term).join(" "); return available.filter((tool) => `${tool.name} ${tool.slug} ${tool.category} ${tool.description} ${expanded}`.toLowerCase().includes(normalized) || expanded.split(/\s+/).some((term) => `${tool.name} ${tool.slug} ${tool.category} ${tool.description}`.toLowerCase().includes(term))); }, [query]);
  return <section className="tool-search" id="tool-search" aria-labelledby="tool-search-heading"><div className="tool-search-heading"><p className="eyebrow">SEARCH TOOLS</p><h2 id="tool-search-heading">Find a contact-file job</h2></div><label className="tool-search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “duplicates”, “Excel”, or “JSON”" aria-label="Search tools" /></label><div className="tool-search-results" aria-live="polite"><p className="tool-search-count">{matches.length} tool{matches.length === 1 ? "" : "s"} found</p>{matches.map((tool) => <Link href={`/tool/${tool.slug}`} key={tool.slug}><strong>{tool.name}</strong><small>{tool.description}</small></Link>)}{!matches.length && <p>No matching tools. Try a format or task word.</p>}</div></section>;
}
