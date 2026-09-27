"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { downloadFile } from "../lib/download";
import { loadLocalImage } from "../lib/image-file";
import { parseVCard } from "../lib/vcard";
import { useLocalOperation } from "../lib/use-local-operation";

type Source = HTMLVideoElement | HTMLImageElement;
type Detector = {
  detect(source: Source): Promise<Array<{ rawValue?: string }>>;
};
type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;
type Reader = {
  decodeFromCanvas(canvas: HTMLCanvasElement): { getText(): string };
};
declare global {
  interface Window {
    BarcodeDetector?: DetectorConstructor;
  }
}

export default function QrCodeReaderWorkspace({
  camera = false,
}: {
  camera?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const readerRef = useRef<Promise<Reader> | null>(null);
  const operation = useLocalOperation();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Choose a QR image");
  const closeStream = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);
  useEffect(() => closeStream, [closeStream]);
  function stop() {
    operation.cancel();
    closeStream();
    setStatus("Camera stopped");
  }
  async function detect(source: Source) {
    if (window.BarcodeDetector) {
      try {
        const results = await new window.BarcodeDetector({
          formats: ["qr_code"],
        }).detect(source);
        if (results[0]?.rawValue) return results[0].rawValue;
      } catch {
        /* Use the local fallback. */
      }
    }
    readerRef.current ??= import("@zxing/browser").then(
      ({ BrowserQRCodeReader }) => new BrowserQRCodeReader() as Reader,
    );
    const reader = await readerRef.current;
    const width =
      source instanceof HTMLVideoElement
        ? source.videoWidth
        : source.naturalWidth;
    const height =
      source instanceof HTMLVideoElement
        ? source.videoHeight
        : source.naturalHeight;
    if (!width || !height) return "";
    const scale = Math.min(1, 2048 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    canvas
      .getContext("2d", { willReadFrequently: true })
      ?.drawImage(source, 0, 0, canvas.width, canvas.height);
    try {
      return reader.decodeFromCanvas(canvas).getText();
    } catch {
      return "";
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
  function apply(raw: string) {
    if (raw.length > 64 * 1024) throw new Error("QR payload is too large.");
    setValue(raw);
    setStatus(
      raw.includes("BEGIN:VCARD")
        ? "vCard QR detected; review the payload"
        : "QR payload detected; it is not a vCard",
    );
  }
  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    closeStream();
    const job = operation.begin();
    setValue("");
    setStatus("Reading QR image…");
    let loaded: Awaited<ReturnType<typeof loadLocalImage>> | undefined;
    try {
      loaded = await loadLocalImage(file);
      if (!job.current()) return;
      const raw = await detect(loaded.image);
      if (!job.current()) return;
      if (raw) apply(raw);
      else setStatus("No readable QR code was found in that image.");
      job.finish();
    } catch (error) {
      if (job.current()) {
        setStatus(
          error instanceof Error ? error.message : "Could not read the image.",
        );
        job.fail();
      }
    } finally {
      loaded?.release();
    }
  }
  async function startCamera() {
    closeStream();
    const job = operation.begin();
    setValue("");
    setStatus("Waiting for camera permission…");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Camera access is unavailable in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (!job.current()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera preview is unavailable.");
      video.srcObject = stream;
      await video.play();
      if (!job.current()) return;
      setStatus("Point the camera at a vCard QR code.");
      const scan = async () => {
        if (!job.current()) return;
        try {
          const raw = await detect(video);
          if (!job.current()) return;
          if (raw) {
            apply(raw);
            closeStream();
            job.finish();
          } else timerRef.current = window.setTimeout(scan, 500);
        } catch {
          if (job.current()) {
            closeStream();
            job.fail();
            setStatus("Camera decoding stopped. Try a QR image instead.");
          }
        }
      };
      void scan();
    } catch (error) {
      if (job.current()) {
        closeStream();
        job.fail();
        setStatus(
          error instanceof Error
            ? error.message
            : "Camera could not be started.",
        );
      }
    }
  }
  function download() {
    try {
      const parsed = parseVCard(value);
      if (
        !parsed.contacts.length ||
        parsed.issues.some((issue) => issue.severity === "error")
      ) {
        setStatus("The payload is not a complete vCard.");
        return;
      }
      downloadFile(value, "scanned-contact.vcf", "text/vcard;charset=utf-8");
    } catch {
      setStatus("The payload could not be read as a vCard.");
    }
  }
  return (
    <div className="creator-card">
      <div className="creator-toolbar">
        <span className="file-icon">QR</span>
        <div>
          <strong>{camera ? "Camera QR scanner" : "QR code to vCard"}</strong>
          <small aria-live="polite">{status}</small>
        </div>
        {value.includes("BEGIN:VCARD") && (
          <button className="primary-button compact" onClick={download}>
            Download VCF
          </button>
        )}
      </div>
      <section className="creator-form">
        <div className="drop-actions">
          <button
            className="primary-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose QR image
          </button>
          {camera && (
            <>
              <button
                className="secondary-button"
                onClick={startCamera}
                disabled={operation.busy}
              >
                Start camera
              </button>
              <button className="text-button" onClick={stop}>
                Stop camera
              </button>
            </>
          )}
          <input
            ref={inputRef}
            aria-label="Choose QR image"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={handleFile}
            hidden
          />
        </div>
        {camera && (
          <video
            ref={videoRef}
            className="qr-camera"
            muted
            playsInline
            aria-label="Camera preview"
          />
        )}
        {value && (
          <label>
            Decoded payload
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={65536}
              rows={10}
              spellCheck={false}
            />
          </label>
        )}
        <p className="mapping-note">
          Images and camera frames stay in this browser. Choose PNG, JPEG, GIF
          or WebP up to 8 MB and 16 megapixels.
        </p>
      </section>
    </div>
  );
}
