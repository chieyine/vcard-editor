import { notFound } from "next/navigation";
import { getTool, tools } from "../../../lib/tools-registry";
import { toolPageMetadata } from "../../../lib/page-metadata";
import { SiteFooter, SiteHeader } from "../../../components/site-chrome";
import { ToolStructuredData } from "../../../components/structured-data";
import ToolWorkspace from "../../../components/tool-workspace";
import ToolSupportingContent from "../../../components/tool-supporting-content";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return tools.filter((tool) => tool.indexable).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const tool = getTool((await params).slug);
  return tool
    ? toolPageMetadata({
        title: `${tool.name} — vCard Editor`,
        description: tool.description,
        path: `/tool/${tool.slug}`,
      })
    : {};
}
export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  return (
    <main>
      <SiteHeader />
      <section className="tool-page" id="content">
        <div className="tool-page-heading">
          <p className="eyebrow">{tool.category}</p>
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
        <ToolWorkspace key={tool.slug} workspace={tool.workspace} />
        <ToolSupportingContent slug={tool.slug} />
      </section>
      <SiteFooter />
      <ToolStructuredData
        name={tool.name}
        description={tool.description}
        path={`/tool/${tool.slug}`}
      />
    </main>
  );
}
