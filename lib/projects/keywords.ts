import type { UnilizeKeyword } from "@/types/unilize";

/** Affiche un label mot-clé que la valeur soit string ou `{ value }`. */
export function formatKeywordLabel(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || "—";
  }
  if (value && typeof value === "object" && "value" in value) {
    const nested = (value as { value: unknown }).value;
    if (typeof nested === "string") {
      const trimmed = nested.trim();
      return trimmed || "—";
    }
  }
  return "—";
}

/** Extrais les valeurs textuelles des mots-clés API. */
export function toKeywordValues(
  keywords: readonly UnilizeKeyword[] | undefined,
): string[] {
  if (!keywords?.length) {
    return [];
  }
  return keywords.map((keyword) => keyword.value);
}

/**
 * Parse une textarea (une valeur par ligne) en objets Keyword.
 * Rejette les doublons (insensible à la casse).
 */
export function parseKeywordsRaw(
  raw: string,
): UnilizeKeyword[] | { error: string } {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { error: "Au moins un mot-clé est requis." };
  }

  const seen = new Set<string>();
  const keywords: UnilizeKeyword[] = [];

  for (const value of lines) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      return { error: `Mot-clé en double : « ${value} ».` };
    }
    seen.add(key);
    keywords.push({ value });
  }

  return keywords;
}

/**
 * Préserve les `theme` des mots-clés existants dont la `value` est conservée.
 */
export function mergeKeywordThemes(
  next: readonly UnilizeKeyword[],
  existing: readonly UnilizeKeyword[] | undefined,
): UnilizeKeyword[] {
  if (!existing?.length) {
    return [...next];
  }

  const themeByValue = new Map<string, string>();
  for (const keyword of existing) {
    const theme = keyword.theme?.trim();
    if (theme) {
      themeByValue.set(keyword.value.toLowerCase(), theme);
    }
  }

  return next.map((keyword) => {
    const theme = themeByValue.get(keyword.value.toLowerCase());
    if (!theme) {
      return { value: keyword.value };
    }
    return { value: keyword.value, theme };
  });
}
