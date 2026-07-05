export function resolvePesertaAvatar(source?: {
  foto_thumbnail?: string | null;
  foto?: string | null;
} | null): string | undefined {
  if (!source) return undefined;
  return source.foto_thumbnail || source.foto || undefined;
}

/** Hanya angka, desimal (.,), dan format waktu (:) — blok huruf */
export function filterNumericTestInput(value: string): string {
  return value.replace(/[^\d.,:]/g, "");
}

export function pesertaInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
