export function createUniqueFileNamer(extension: string) {
  const used = new Set<string>();
  return (stem: string) => {
    const safeStem = stem.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "file";
    let candidate = `${safeStem}${extension}`;
    for (let attempt = 2; used.has(candidate); attempt += 1) candidate = `${safeStem}-${attempt}${extension}`;
    used.add(candidate);
    return candidate;
  };
}
