import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "VCF validator — vCard Editor", description: "Validate contact-file structure, versions, and common field problems locally.", alternates: { canonical: "/tool/vcf-validator" } };
export default function Page() { return <ContactToolPage mode="validator" eyebrow="VALIDATE & REPAIR" title="VCF validator" description="Inspect versions, malformed lines, empty contacts, and email-format warnings before import." />; }
