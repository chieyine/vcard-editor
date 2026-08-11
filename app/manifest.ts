import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "vCard Editor", short_name: "vCard Editor", description: "Private browser-based tools for contact files.", start_url: "/", display: "standalone", background_color: "#f7f8f5", theme_color: "#1b684e", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
