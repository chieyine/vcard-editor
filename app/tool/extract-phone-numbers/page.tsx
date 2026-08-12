import { permanentRedirect } from "next/navigation";
export const metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/tool/extract-phone-numbers-from-vcf" } };
export default function Page(): never { permanentRedirect("/tool/extract-phone-numbers-from-vcf"); }
