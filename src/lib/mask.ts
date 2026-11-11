/** Censor a name for display: keep each word's first letter, star the rest ("Jane Doe" -> "J*** D**"). */
export function mask(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      const chars = [...w];
      return chars[0] + "*".repeat(chars.length - 1);
    })
    .join(" ");
}

/** Normalise a phone number to the wa.me format (62…, no plus). */
export function waNumber(raw: string): string {
  let n = String(raw).replace(/^\+/, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return n;
}
