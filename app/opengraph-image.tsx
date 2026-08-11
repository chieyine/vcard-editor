import { ImageResponse } from "next/og";

export const alt = "vCard Editor — private contact-file tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f3f7f3", color: "#1d2926", fontFamily: "Arial, sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 12, background: "#1b684e", color: "white" }}>VC</span>vCard Editor</div><div style={{ display: "flex", flexDirection: "column", gap: 24 }}><div style={{ maxWidth: 940, fontSize: 78, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4 }}>Edit, convert, and clean contact files privately.</div><div style={{ fontSize: 26, color: "#5f7069" }}>Local processing / No account / Standards-aware vCard tools</div></div><div style={{ display: "flex", alignItems: "center", gap: 12, color: "#1b684e", fontSize: 22 }}><span>vcardeditor.com</span><span>-</span><span>Your file stays in your browser</span></div></div>, size);
}
