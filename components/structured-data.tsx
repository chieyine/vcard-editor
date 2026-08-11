import { siteUrl } from "../lib/site-config";

export function WebsiteStructuredData() {
  const data = { "@context": "https://schema.org", "@type": "WebSite", name: "vCard Editor", alternateName: "VCF Editor", url: siteUrl };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ToolStructuredData({ name, description, path }: { name: string; description: string; path: string }) {
  const data = { "@context": "https://schema.org", "@type": "WebApplication", name, description, url: `${siteUrl}${path}`, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name, item: `${siteUrl}${path}` }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} /></>;
}
