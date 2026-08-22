import { ContactToolPage } from "../../../components/contact-tool-page";
import { toolPageMetadata } from "../../../lib/page-metadata";
export const metadata = toolPageMetadata({ title: "Normalize phone numbers — vCard Editor", description: "Standardize phone-number formatting with an explicit country-code rule.", path: "/tool/normalize-phone-numbers" });
export default function Page() { return <ContactToolPage mode="normalize-phones" eyebrow="CLEAN & REPAIR" title="Normalize phone numbers" description="Standardize phone formatting with a visible country-code setting and a review before export." />; }
