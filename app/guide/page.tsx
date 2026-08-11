import { ContentDirectory } from "../../components/content-directory";
import { guides } from "../../lib/content-registry";

export const metadata = { title: "Guides — vCard Editor", description: "Practical guides for opening, converting, importing, cleaning, and repairing VCF contact files.", alternates: { canonical: "/guide" } };
export default function GuidesPage() { return <ContentDirectory kind="guide" title="Practical guides for contact-file jobs." intro="Short, tested explanations that lead to a working tool when you need to open, move, repair, or clean contacts." pages={guides} />; }
