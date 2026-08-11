import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "VCF repair — vCard Editor", description: "Repair common VCF line-ending and structural problems locally.", alternates: { canonical: "/tool/vcf-repair" } };
export default function Page() { return <ContactToolPage mode="repair" eyebrow="VALIDATE & REPAIR" title="VCF repair" description="Normalize line endings, close an unfinished card, and export a repaired vCard." />; }
