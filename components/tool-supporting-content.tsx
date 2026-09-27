import Link from "next/link";
import { getTool, tools } from "../lib/tools-registry";

export default function ToolSupportingContent({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  const related = tools
    .filter(
      (entry) =>
        entry.slug !== slug &&
        entry.category === tool.category &&
        entry.indexable,
    )
    .slice(0, 3);
  return (
    <section className="tool-supporting" aria-label="Tool details">
      <p className="mapping-note">
        Input: {tool.inputFormats.join(", ") || "entered details"}. Output:{" "}
        {tool.outputFormats.join(", ") || "on-screen inspection"}. Files stay in
        this browser. Keep the original and review the output in your
        destination app.
      </p>
      <details>
        <summary>Related tools</summary>
        <nav aria-label="Related tools">
          {related.map((entry) => (
            <Link href={`/tool/${entry.slug}`} key={entry.slug}>
              {entry.name}
            </Link>
          ))}
        </nav>
      </details>
    </section>
  );
}
