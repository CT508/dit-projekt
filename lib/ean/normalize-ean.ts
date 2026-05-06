export function normalizeEan(input: unknown): string {
  if (input === null || input === undefined) {
    return "";
  }

  return String(input)
    .trim()
    .replace(/[\s-]+/g, "")
    .replace(/[^\d]/g, "");
}

