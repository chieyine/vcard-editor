export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const LARGE_FILE_BYTES = 8 * 1024 * 1024;

export type FileGuardResult = { ok: true; warning?: string } | { ok: false; message: string };

export function guardFile(file: File, allowedExtensions: string[]): FileGuardResult {
  const lowerName = file.name.toLowerCase();
  const allowed = allowedExtensions.some((extension) => lowerName.endsWith(extension));
  if (!allowed) return { ok: false, message: `Choose a supported file: ${allowedExtensions.join(", ")}.` };
  if (file.size > MAX_FILE_BYTES) return { ok: false, message: `That file is ${formatBytes(file.size)}. Files over ${formatBytes(MAX_FILE_BYTES)} are refused to protect browser memory.` };
  if (file.size > LARGE_FILE_BYTES) return { ok: true, warning: `Large file: ${formatBytes(file.size)}. Processing may take a little longer.` };
  return { ok: true };
}

export function guardContactFile(file: File) {
  return guardFile(file, [".vcf", ".vcard", ".csv", ".xlsx", ".xls"]);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
