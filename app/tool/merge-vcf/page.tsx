import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Merge VCF files — vCard Editor", description: "Combine multiple VCF files into one local multi-contact file.", path: "/tool/merge-vcf" });
export default function Page() { return <ContactToolPage mode="merge" eyebrow="MERGE & SPLIT" title="Merge VCF files" description="Combine separate contact files into one multi-contact VCF without uploading them." />; }
