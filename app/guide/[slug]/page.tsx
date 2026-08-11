import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "../../../components/content-page";
import { getGuide, guides } from "../../../lib/content-registry";

export function generateStaticParams() { return guides.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const page = getGuide((await params).slug); if (!page) return {}; return { title: page.metaTitle, description: page.description, alternates: { canonical: `/guide/${page.slug}` }, openGraph: { title: page.metaTitle, description: page.description, type: "article", url: `/guide/${page.slug}` } }; }
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) { const page = getGuide((await params).slug); if (!page) notFound(); return <ContentPageView page={page} kind="guide" />; }
