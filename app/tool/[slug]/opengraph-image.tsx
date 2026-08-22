import { ImageResponse } from "next/og";
import { getTool } from "../../../lib/tools-registry";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "vCard Editor tool";

export default async function ToolOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const name = tool?.name ?? "Contact-file tools";
  const category = tool?.category ?? "Local workspace";
  const description = tool?.description ?? "Local-first tools for opening, converting, cleaning, and repairing contact files.";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f3f7f3", color: "#1d2926", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 12, background: "#1b684e", color: "white" }}>VC</span>
          vCard Editor
          <span style={{ marginLeft: 12, padding: "6px 16px", borderRadius: 999, border: "2px solid #1b684e", color: "#1b684e", fontSize: 20 }}>{category}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ maxWidth: 1000, fontSize: name.length > 34 ? 62 : 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>{name}</div>
          <div style={{ maxWidth: 960, fontSize: 27, color: "#5f7069" }}>{description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#1b684e", fontSize: 22 }}>
          <span>vcardeditor.com</span>
          <span>-</span>
          <span>Processed locally in your browser</span>
        </div>
      </div>
    ),
    size,
  );
}
