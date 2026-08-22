"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { parseVCard, serializeVCards } from "../lib/vcard";

type DetectorSource = ImageBitmap | HTMLVideoElement | HTMLImageElement;
type Detector = { detect(source: DetectorSource): Promise<Array<{ rawValue?: string }>> };
type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;
type LocalReader = { decodeFromCanvas(canvas: HTMLCanvasElement): { getText(): string } };
declare global { interface Window { BarcodeDetector?: DetectorConstructor } }

function download(content: string, name: string) { const blob = new Blob([content], { type: "text/vcard;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }

export default function QrCodeReaderWorkspace({ camera = false }: { camera?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null); const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const scanningRef = useRef(false); const localReaderRef = useRef<Promise<LocalReader> | null>(null); const [value, setValue] = useState(""); const [status, setStatus] = useState("Choose a QR image");
  function applyPayload(raw: string) { setValue(raw); setStatus(raw.includes("BEGIN:VCARD") ? "vCard QR detected" : "QR payload detected; it is not a vCard."); }
  async function localDetect(source: DetectorSource) {
    localReaderRef.current ??= import("@zxing/browser").then(({ BrowserQRCodeReader }) => new BrowserQRCodeReader() as LocalReader);
    const reader = await localReaderRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = source instanceof HTMLVideoElement ? source.videoWidth : source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    canvas.height = source instanceof HTMLVideoElement ? source.videoHeight : source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    if (!canvas.width || !canvas.height) return "";
    canvas.getContext("2d", { willReadFrequently: true })?.drawImage(source, 0, 0, canvas.width, canvas.height);
    try { return reader.decodeFromCanvas(canvas).getText(); } catch { return ""; }
  }
  async function detect(source: DetectorSource) {
    if (window.BarcodeDetector) {
      try {
        const results = await new window.BarcodeDetector({ formats: ["qr_code"] }).detect(source);
        const raw = results[0]?.rawValue ?? "";
        if (raw) { applyPayload(raw); return true; }
      } catch { /* Fall through to the local decoder for browser/API quirks. */ }
    }
    const raw = await localDetect(source);
    if (!raw) return false;
    applyPayload(raw);
    return true;
  }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); try { const image = new Image(); image.src = url; await image.decode(); const found = await detect(image); if (!found) setStatus("No readable QR code was found in that image."); } catch { setStatus("That image could not be opened or decoded locally."); } finally { URL.revokeObjectURL(url); } event.target.value = ""; }
  async function startCamera() { if (!navigator.mediaDevices?.getUserMedia) { setStatus("Camera access is not available in this browser."); return; } stopCamera(); try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); streamRef.current = stream; scanningRef.current = true; if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setStatus("Point the camera at a vCard QR code."); const scan = async () => { if (!scanningRef.current || !streamRef.current || !videoRef.current) return; const found = await detect(videoRef.current); if (found) { stopCamera(); return; } window.setTimeout(scan, 500); }; void scan(); } } catch { setStatus("Camera permission was not granted."); } }
  function stopCamera() { scanningRef.current = false; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; }
  useEffect(() => () => { scanningRef.current = false; streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);
  const isVCard = value.includes("BEGIN:VCARD");
  return <div className="creator-card"><div className="creator-toolbar"><span className="file-icon">QR</span><div><strong>{camera ? "Camera QR scanner" : "QR code to vCard"}</strong><small aria-live="polite">{status}</small></div>{isVCard && <button className="primary-button compact" onClick={() => download(serializeVCards(parseVCard(value).contacts, { version: "3.0" }), "scanned-contact.vcf")}>Download VCF <span>↓</span></button>}</div><section className="creator-form"><div className="drop-actions"><button className="primary-button" onClick={() => inputRef.current?.click()}>Choose QR image</button>{camera && <><button className="secondary-button" onClick={startCamera}>Start camera</button><button className="text-button" onClick={stopCamera}>Stop camera</button></>}<input ref={inputRef} aria-label="Choose QR image" type="file" accept="image/*" onChange={handleFile} hidden /></div>{camera && <video ref={videoRef} className="qr-camera" muted playsInline aria-label="Camera preview" />}{value && <label>Decoded payload<textarea value={value} onChange={(event) => setValue(event.target.value)} rows={10} spellCheck={false} /></label>}<p className="mapping-note">QR decoding is entirely local. A built-in browser detector is used when available, with an offline fallback for Safari, Firefox, and older browsers. Images and camera frames are never uploaded.</p></section></div>;
}
