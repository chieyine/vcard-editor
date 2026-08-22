import type { Metadata } from "next";

export function toolPageMetadata(params: { title: string; description: string; path: string }): Metadata {
  const image = `${params.path}/opengraph-image`;
  return {
    title: params.title,
    description: params.description,
    alternates: { canonical: params.path },
    openGraph: { title: params.title, description: params.description, type: "website", url: params.path, images: [{ url: image, width: 1200, height: 630, alt: params.title }] },
    twitter: { card: "summary_large_image", title: params.title, description: params.description, images: [image] },
  };
}
