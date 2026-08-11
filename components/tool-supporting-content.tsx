import Link from "next/link";
import { tools } from "../lib/tools-registry";

export default function ToolSupportingContent({ slug }: { slug: string }) {
  const tool = tools.find((entry) => entry.slug === slug);
  if (!tool) return null;
  const related = tools.filter((entry) => entry.slug !== slug && entry.category === tool.category && entry.indexable).slice(0, 3);
  const inputs = tool.inputFormats.length ? tool.inputFormats.join(", ") : "details entered in the workspace";
  const outputs = tool.outputFormats.length ? tool.outputFormats.join(", ") : "an on-screen review";

  return <section className="tool-supporting" aria-labelledby={`${slug}-guide`}>
    <div className="tool-supporting-intro"><p className="eyebrow">HOW TO USE THIS TOOL</p><h2 id={`${slug}-guide`}>{tool.name}, without uploading contact data</h2><p>{tool.description} The processor runs in this browser, keeps the original source unchanged, and asks you to review the result before any download.</p></div>
    <div className="tool-supporting-grid">
      <article><span>01</span><h3>Choose or enter the source</h3><p>Use {inputs}. File type hints help with selection, while the processor also checks the content before using it.</p></article>
      <article><span>02</span><h3>Review the local result</h3><p>Check names, phone numbers, email addresses, warnings, and field mappings. Keep the original backup until the destination accepts the new file.</p></article>
      <article><span>03</span><h3>Download deliberately</h3><p>The expected result is {outputs}. Browser and destination-app support can vary, so test a small copy before a full migration.</p></article>
    </div>
    <div className="tool-supporting-notes"><div><h3>Privacy and limitations</h3><p>No contact value or filename is intentionally sent to vCard Editor analytics. Very large inputs are bounded, remote photo URLs are never fetched, and compatibility guidance does not claim a destination app has been tested unless a dated record says so.</p></div><nav aria-label={`Related ${tool.name} tools`}><strong>Related tools</strong>{related.map((entry) => <Link href={`/tool/${entry.slug}`} key={entry.slug}>{entry.name}<span aria-hidden="true">→</span></Link>)}</nav></div>
  </section>;
}
