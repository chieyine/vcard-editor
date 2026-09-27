const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 16_000_000;

/** Read dimensions from the encoded header before asking a decoder to allocate pixels. */
export function imageDimensions(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_IMAGE_BYTES)
    throw new Error("Use an image smaller than 8 MB.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset: number, count: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + count));
  let width = 0;
  let height = 0;
  if (bytes.length >= 24 && bytes[0] === 137 && ascii(1, 3) === "PNG") {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (bytes.length >= 10 && /^GIF8[79]a$/.test(ascii(0, 6))) {
    width = view.getUint16(6, true);
    height = view.getUint16(8, true);
  } else if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 0xff) break;
      while (bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker) &&
        length >= 7
      ) {
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  } else if (
    bytes.length >= 30 &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP"
  ) {
    const kind = ascii(12, 4);
    if (kind === "VP8X") {
      width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    } else if (
      kind === "VP8 " &&
      bytes[23] === 0x9d &&
      bytes[24] === 0x01 &&
      bytes[25] === 0x2a
    ) {
      width = view.getUint16(26, true) & 0x3fff;
      height = view.getUint16(28, true) & 0x3fff;
    } else if (kind === "VP8L" && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true);
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
    }
  }
  if (!width || !height)
    throw new Error("Choose a readable PNG, JPEG, GIF or WebP image.");
  if (width > 8192 || height > 8192 || width * height > MAX_PIXELS)
    throw new Error(
      "Use an image no larger than 16 megapixels and 8,192 pixels per side.",
    );
  return { width, height };
}

export async function loadLocalImage(file: Blob) {
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("Use an image smaller than 8 MB.");
  imageDimensions(new Uint8Array(await file.arrayBuffer()));
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > MAX_PIXELS)
      throw new Error("Decoded image exceeds 16 megapixels.");
    return {
      image,
      release: () => {
        image.src = "";
        URL.revokeObjectURL(url);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
