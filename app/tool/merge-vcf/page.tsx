import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "Merge VCF files — vCard Editor", description: "Combine multiple VCF files into one local multi-contact file.", alternates: { canonical: "/tool/merge-vcf" } };
export default function Page() { return <ContactToolPage mode="merge" eyebrow="MERGE & SPLIT" title="Merge VCF files" description="Combine separate contact files into one multi-contact VCF without uploading them." />; }
