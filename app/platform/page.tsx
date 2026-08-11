import { ContentDirectory } from "../../components/content-directory";
import { platforms } from "../../lib/content-registry";

export const metadata = { title: "Platform workflows — vCard Editor", description: "Prepare and move contact files between VCF, Excel, Google Contacts, iCloud, Outlook, iPhone, and Android.", alternates: { canonical: "/platform" } };
export default function PlatformsPage() { return <ContentDirectory kind="platform" title="Move contacts between the tools you already use." intro="Platform-specific workflows for reviewing, converting, and importing contact files without losing the source backup." pages={platforms} />; }
