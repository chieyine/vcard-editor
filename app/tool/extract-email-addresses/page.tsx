import { ContactToolPage } from "../../../components/contact-tool-page";
export const metadata = { title: "Extract email addresses — vCard Editor", description: "Extract email addresses from a VCF into a CSV file locally.", alternates: { canonical: "/tool/extract-email-addresses" } };
export default function Page() { return <ContactToolPage mode="extract-emails" eyebrow="EXTRACT & TRANSFORM" title="Extract email addresses" description="Create a simple CSV of email addresses with contact names and organisations." />; }
