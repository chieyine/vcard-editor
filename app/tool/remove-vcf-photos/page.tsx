import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "Remove contact photos — vCard Editor", description: "Remove embedded contact photos from a VCF locally.", alternates: { canonical: "/tool/remove-vcf-photos" } };
export default function Page() { return <ContactToolPage mode="remove-photos" eyebrow="CLEAN & REPAIR" title="Remove contact photos" description="Remove PHOTO fields to reduce file size while preserving the rest of each contact." />; }
