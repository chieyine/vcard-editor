import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "VCF repair — vCard Editor", description: "Repair common VCF line-ending and structural problems locally.", path: "/tool/vcf-repair" });
export default function Page() { return <ContactToolPage mode="repair" eyebrow="VALIDATE & REPAIR" title="VCF repair" description="Normalize line endings, close an unfinished card, and export a repaired vCard." />; }
