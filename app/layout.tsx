import type { Metadata } from "next";
import "./globals.css";
import { isPreviewDeployment } from "../lib/feature-flags";
import { PageViewTracker } from "../components/page-view-tracker";
import { ServiceWorkerRegister } from "../components/service-worker-register";
import { siteUrl } from "../lib/site-config";

const verification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "vCard Editor — Edit, convert, and clean contact files",
  description:
    "Open VCF files, edit contact details, and export a compatible vCard. Your contact file stays in your browser.",
  applicationName: "vCard Editor",
  keywords: ["vCard editor", "VCF editor", "VCF viewer", "contact file tools"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "vCard Editor — Edit, convert, and clean contact files",
    description: "Open, edit, and export contact files locally in your browser.",
    type: "website",
    url: siteUrl,
    siteName: "vCard Editor",
  },
  twitter: { card: "summary_large_image", title: "vCard Editor — Private contact-file tools", description: "Open, edit, convert, clean, and repair VCF files locally in your browser." },
  robots: isPreviewDeployment ? { index: false, follow: false } : { index: true, follow: true },
  ...(Object.keys(verification).length ? { verification } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PageViewTracker /><ServiceWorkerRegister />{children}</body>
    </html>
  );
}
