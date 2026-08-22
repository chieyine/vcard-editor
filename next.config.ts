import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// scripts/csp-hashes.mjs records the sha256 of every inline bootstrap script
// in the prerendered HTML after each build, so production can enforce a
// strict script-src without 'unsafe-inline' while routes stay static.
function inlineScriptHashes(): string[] {
  const file = resolve(process.cwd(), ".next", "csp-inline-hashes.json");
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8")) as string[];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hash-based Subresource Integrity lets production omit 'unsafe-inline'
  // from script-src while keeping every route statically prerendered.
  experimental: { sri: { algorithm: "sha256" } },
  async redirects() {
    return [
      { source: "/tool/extract-phone-numbers", destination: "/tool/extract-phone-numbers-from-vcf", permanent: true },
      { source: "/tool/extract-email-addresses", destination: "/tool/extract-emails-from-vcf", permanent: true },
      { source: "/platform/import-vcf-google-contacts", destination: "/guide/import-vcf-google-contacts", permanent: true },
      { source: "/platform/google-contacts-import-vcf", destination: "/guide/import-vcf-google-contacts", permanent: true },
      { source: "/platform/import-vcf-icloud", destination: "/guide/import-vcf-icloud", permanent: true },
      { source: "/platform/import-vcf-outlook", destination: "/guide/import-vcf-outlook", permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vcardeditor.com" }],
        destination: "https://vcardeditor.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";
    const scriptPolicy = isDevelopment ? "'self' 'unsafe-inline' 'unsafe-eval'" : ["'self'", "https://va.vercel-scripts.com", ...inlineScriptHashes()].join(" ");
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: `default-src 'self'; script-src ${scriptPolicy}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` },
        ...(!isDevelopment ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }];
  },
};

export default nextConfig;
