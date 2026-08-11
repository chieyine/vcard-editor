import type { Contact } from "./vcard";

export const MAX_DECODED_PHOTO_BYTES = 8 * 1024 * 1024;

function decodeBase64(value: string) {
  const compact = value.replace(/\s+/g, "");
  if (!/^[a-z0-9+/]*={0,2}$/i.test(compact) || compact.length % 4 === 1) throw new Error("Invalid base64 photo data.");
  const binary = atob(compact);
  if (binary.length > MAX_DECODED_PHOTO_BYTES) throw new Error("Embedded photo exceeds the safe 8 MB decoded limit.");
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function detectedType(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  return "";
}

export function embeddedPhoto(contact: Contact) {
  const value = contact.photo.trim();
  if (!value || /^(https?|ftp):/i.test(value)) return null;
  const data = value.match(/^data:([^;,]+);base64,([\s\S]+)$/i);
  const bytes = decodeBase64(data?.[2] ?? value);
  const type = detectedType(bytes);
  if (!type) throw new Error("Only embedded JPEG, PNG, GIF, or WebP photos are previewed.");
  const declared = data?.[1]?.toLowerCase() || contact.photoType?.toLowerCase() || "";
  if (declared && declared.startsWith("image/") && declared !== type && !(declared === "image/jpg" && type === "image/jpeg")) throw new Error("The declared photo type does not match its bytes.");
  const extension = type === "image/jpeg" ? "jpg" : type.split("/")[1];
  return { bytes, type, extension };
}

export function bytesToDataUri(bytes: Uint8Array, type: string) {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return `data:${type};base64,${btoa(binary)}`;
}

export function safePhotoFileName(contact: Contact, index: number, extension: string) {
  const stem = (contact.formattedName || `contact-${index + 1}`).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 64).toLowerCase() || `contact-${index + 1}`;
  return `${String(index + 1).padStart(4, "0")}-${stem}.${extension}`;
}
