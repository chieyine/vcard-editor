import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "Extract phone numbers — vCard Editor", description: "Extract phone numbers from a VCF into a CSV file locally.", alternates: { canonical: "/tool/extract-phone-numbers" } };
export default function Page() { return <ContactToolPage mode="extract-phones" eyebrow="EXTRACT & TRANSFORM" title="Extract phone numbers" description="Create a simple CSV of phone numbers with contact names and organisations." />; }
