import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "Split VCF file — vCard Editor", description: "Split a multi-contact VCF into individual cards in a ZIP.", alternates: { canonical: "/tool/split-vcf" } };
export default function Page() { return <ContactToolPage mode="split" eyebrow="MERGE & SPLIT" title="Split VCF file" description="Separate a multi-contact VCF into individual cards in a downloadable ZIP." />; }
