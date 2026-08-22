import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
    const scriptPolicy = isDevelopment
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline' https://va.vercel-scripts.com";
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
