import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "../../../components/content-page";
import { formats, getFormat } from "../../../lib/content-registry";

export function generateStaticParams() { return formats.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const page = getFormat((await params).slug); if (!page) return {}; return { title: page.metaTitle, description: page.description, authors: [{ name: "vCard Editor" }], alternates: { canonical: `/format/${page.slug}` }, openGraph: { title: page.metaTitle, description: page.description, type: "article", url: `/format/${page.slug}`, publishedTime: `${page.lastReviewed}T00:00:00.000Z`, modifiedTime: `${page.lastReviewed}T00:00:00.000Z`, authors: ["vCard Editor"], images: [{ url: "/opengraph-image", alt: `${page.title} — vCard Editor` }] }, twitter: { card: "summary_large_image", title: page.metaTitle, description: page.description, images: ["/opengraph-image"] } }; }
export default async function FormatPage({ params }: { params: Promise<{ slug: string }> }) { const page = getFormat((await params).slug); if (!page) notFound(); return <ContentPageView page={page} kind="format" />; }
