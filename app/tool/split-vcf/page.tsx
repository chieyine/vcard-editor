import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Split VCF file — vCard Editor", description: "Split a multi-contact VCF into individual cards in a ZIP.", path: "/tool/split-vcf" });
export default function Page() { return <ContactToolPage mode="split" eyebrow="MERGE & SPLIT" title="Split VCF file" description="Separate a multi-contact VCF into individual cards in a downloadable ZIP." />; }
