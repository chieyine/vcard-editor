import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import ToolSearch from "../../components/tool-search";

export const metadata = {
  title: "Tools — vCard Editor",
  description:
    "Local-first tools for opening, converting, cleaning, and repairing contact files.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="directory-page" id="content">
        <p className="eyebrow">THE TOOLBOX</p>
        <h1>Contact-file tools, built around the job.</h1>
        <p className="directory-intro">
          Every tool is designed to run in your browser. Search by task, format,
          or platform synonym.
        </p>
        <ToolSearch />
      </section>
      <SiteFooter />
    </main>
  );
}
