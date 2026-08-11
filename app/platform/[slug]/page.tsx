import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageView } from "../../../components/content-page";
import { getPlatform, platforms } from "../../../lib/content-registry";

export function generateStaticParams() { return platforms.map((page) => ({ slug: page.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const page = getPlatform((await params).slug); if (!page) return {}; return { title: page.metaTitle, description: page.description, alternates: { canonical: `/platform/${page.slug}` }, openGraph: { title: page.metaTitle, description: page.description, type: "article", url: `/platform/${page.slug}` } }; }
export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) { const page = getPlatform((await params).slug); if (!page) notFound(); return <ContentPageView page={page} kind="platform" />; }
