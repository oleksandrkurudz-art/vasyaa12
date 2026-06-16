// Теги зберігаються як рядок через кому (SQLite не має масивів).
// Тут — єдине місце для розбору/нормалізації тегів.

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function formatTags(tags: string[]): string {
  return Array.from(new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))).join(", ");
}
