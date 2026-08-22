import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF validator — vCard Editor", description: "Validate contact-file structure, versions, and common field problems locally.", path: "/tool/vcf-validator" });
export default function Page() { return <ContactToolPage mode="validator" eyebrow="VALIDATE & REPAIR" title="VCF validator" description="Inspect versions, malformed lines, empty contacts, and email-format warnings before import." />; }
