import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const roots = ["app", "components", "lib"];
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path);
  }
}
for (const root of roots) await collect(root);
const failures = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  if (/\beval\s*\(|new\s+Function\s*\(/.test(source)) failures.push(`${file}: dynamic code execution is not allowed`);
  if (/console\.(log|warn|error)\s*\(/.test(source)) failures.push(`${file}: production console logging is not allowed`);
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`lint: checked ${files.length} TypeScript files`);

