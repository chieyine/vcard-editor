import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "../../../components/content-page";
import { formats, getFormat } from "../../../lib/content-registry";

export function generateStaticParams() { return formats.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const page = getFormat((await params).slug); if (!page) return {}; return { title: page.metaTitle, description: page.description, alternates: { canonical: `/format/${page.slug}` }, openGraph: { title: page.metaTitle, description: page.description, type: "article", url: `/format/${page.slug}` } }; }
export default async function FormatPage({ params }: { params: Promise<{ slug: string }> }) { const page = getFormat((await params).slug); if (!page) notFound(); return <ContentPageView page={page} kind="format" />; }
