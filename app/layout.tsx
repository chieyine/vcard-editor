import type { Metadata } from "next";
import "./globals.css";
import { analyticsEnabled, isPreviewDeployment } from "../lib/feature-flags";
import { PageViewTracker } from "../components/page-view-tracker";
import { ServiceWorkerRegister } from "../components/service-worker-register";
import { siteUrl } from "../lib/site-config";
import { Analytics } from "@vercel/analytics/next";

const verification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
};

const shouldLoadVercelAnalytics = process.env.VERCEL === "1" || analyticsEnabled;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "vCard Editor — Edit, convert, and clean contact files",
  description:
    "Open VCF files, edit contact details, and export a compatible vCard. Your contact file stays in your browser.",
  applicationName: "vCard Editor",
  creator: "vCard Editor",
  publisher: "vCard Editor",
  category: "utilities",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  keywords: ["vCard editor", "VCF editor", "VCF viewer", "contact file tools"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "vCard Editor — Edit, convert, and clean contact files",
    description: "Open, edit, and export contact files locally in your browser.",
    type: "website",
    url: siteUrl,
    siteName: "vCard Editor",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "vCard Editor — private contact-file tools" }],
  },
  twitter: { card: "summary_large_image", title: "vCard Editor — Private contact-file tools", description: "Open, edit, convert, clean, and repair VCF files locally in your browser.", images: ["/opengraph-image"] },
  robots: isPreviewDeployment ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  ...(Object.keys(verification).length ? { verification } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PageViewTracker /><ServiceWorkerRegister />{children}{shouldLoadVercelAnalytics && <Analytics />}</body>
    </html>
  );
}
