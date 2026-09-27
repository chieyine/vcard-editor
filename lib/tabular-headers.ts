/** Records use header names as keys, so every source column needs its own key. */
export function uniqueHeaders(values: string[], warnings: string[]) {
  const labels = Array.from(
    values,
    (value, index) => value?.trim() || `Column ${index + 1}`,
  );
  const reserved = new Set(labels);
  const used = new Set<string>();
  return labels.map((label) => {
    let name = label;
    let suffix = 2;
    while (used.has(name)) {
      do {
        name = `${label} ${suffix++}`;
      } while (reserved.has(name) || used.has(name));
    }
    if (name !== label)
      warnings.push(
        `Repeated column "${label}" was renamed "${name}"; review its mapping.`,
      );
    used.add(name);
    return name;
  });
}
