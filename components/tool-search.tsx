"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);
  const matches = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return tools.filter((tool) => {
      if (!tool.indexable) return false;
      const searchable =
        `${tool.name} ${tool.slug} ${tool.category} ${tool.description}`.toLowerCase();
      return terms.every((term) =>
        [term, ...(synonyms[term]?.split(" ") ?? [])].some((candidate) =>
          searchable.includes(candidate),
        ),
      );
    });
  }, [query]);

  return (
    <>
      <section
        className="tool-search"
        id="tool-search"
        aria-labelledby="tool-search-heading"
      >
        <h2 id="tool-search-heading">Find a tool</h2>
        <label className="tool-search-box">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by task or format"
            aria-label="Search tools"
          />
        </label>
        <p className="tool-search-count" role="status">
          {matches.length} tool{matches.length === 1 ? "" : "s"} found
        </p>
      </section>
      <div className="directory-grid">
        {matches.map((tool) => (
          <Link
            className="directory-card"
            href={`/tool/${tool.slug}`}
            key={tool.slug}
          >
            <span className="directory-card-top">
              <span className="job-number">{tool.category}</span>
            </span>
            <strong>{tool.name}</strong>
            <p>{tool.description}</p>
            <span className="directory-card-bottom">
              {tool.inputFormats.length
                ? tool.inputFormats.join(" · ")
                : "Enter contact details"}
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </div>
      {!matches.length && (
        <p>No matching tools. Try “Excel”, “merge”, or “duplicates”.</p>
      )}
    </>
  );
}
