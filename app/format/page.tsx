import { ContentDirectory } from "../../components/content-directory";
import { formats } from "../../lib/content-registry";

export const metadata = { title: "vCard formats — vCard Editor", description: "Reference pages for vCard versions, properties, phone fields, line folding, and MIME types.", alternates: { canonical: "/format" } };
export default function FormatsPage() { return <ContentDirectory kind="format" title="A clear reference for vCard files." intro="Understand the fields, versions, and encoding rules that make contact migrations succeed or fail." pages={formats} />; }
