import { permanentRedirect } from "next/navigation";
export const metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/tool/extract-emails-from-vcf" } };
export default function Page(): never { permanentRedirect("/tool/extract-emails-from-vcf"); }
