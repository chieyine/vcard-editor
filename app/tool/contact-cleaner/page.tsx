import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Contact cleaner — vCard Editor", description: "Clean common contact-file problems locally in your browser.", path: "/tool/contact-cleaner" });
export default function Page() { return <ContactToolPage mode="cleaner" eyebrow="CLEAN & REPAIR" title="Contact cleaner" description="Trim whitespace, normalize emails and phones, remove empty contacts, and review the result before exporting." />; }
