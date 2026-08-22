import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Remove contact photos — vCard Editor", description: "Remove embedded contact photos from a VCF locally.", path: "/tool/remove-vcf-photos" });
export default function Page() { return <ContactToolPage mode="remove-photos" eyebrow="CLEAN & REPAIR" title="Remove contact photos" description="Remove PHOTO fields to reduce file size while preserving the rest of each contact." />; }
