import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const root = join(".next", "server", "app");

async function collect(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path, files);
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

const files = await collect(root);
if (!files.length) throw new Error("csp: no prerendered HTML found; run next build first");

const hashes = new Set();
const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const [, attrs, content] of html.matchAll(pattern)) {
    if (/\bsrc=/.test(attrs)) continue;
    if (/type\s*=\s*["']?application\/ld\+json/.test(attrs)) continue;
    if (!content.trim()) continue;
    hashes.add(`'sha256-${createHash("sha256").update(content).digest("base64")}'`);
  }
}

await writeFile(join(".next", "csp-inline-hashes.json"), `${JSON.stringify([...hashes], null, 2)}\n`);
console.log(`csp: hashed ${hashes.size} unique inline scripts across ${files.length} prerendered pages`);

// next start serves headers from the build-time routes manifest, so the
// generated hashes must be merged into its stored CSP header as well.
const manifestPath = join(".next", "routes-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
let patched = 0;
for (const entry of manifest.headers ?? []) {
  for (const header of entry.headers ?? []) {
    if (header.key.toLowerCase() !== "content-security-policy") continue;
    if (!/script-src 'self'/.test(header.value)) continue;
    header.value = header.value.replace("script-src 'self'", `script-src 'self' ${[...hashes].join(" ")}`);
    patched += 1;
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`csp: injected hashes into ${patched} manifest header${patched === 1 ? "" : "s"}`);
