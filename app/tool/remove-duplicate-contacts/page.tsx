import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Remove duplicate contacts — vCard Editor", description: "Review probable duplicate contacts before removing or merging them.", path: "/tool/remove-duplicate-contacts" });
export default function Page() { return <ContactToolPage mode="dedupe" eyebrow="CLEAN & DEDUPLICATE" title="Remove duplicate contacts" description="Find matching phone numbers, email addresses, and contact names, then review the groups before changing anything." />; }
