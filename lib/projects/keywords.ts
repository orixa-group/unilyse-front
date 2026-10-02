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
  return keywords.map((keyword) => formatKeywordLabel(keyword));
}

/**
 * @deprecated OpenAPI v2 — utiliser parseThemeEditorState / parseKeywordsJson.
 */
export function parseKeywordsRaw(
  _raw: string,
): UnilizeKeyword[] | { error: string } {
  return {
    error:
      "Format obsolète : chaque mot-clé doit être rattaché à une thématique.",
  };
}

/** Filtre client-side des lignes de tableau par mot-clé (correspondance partielle). */
export function filterRowsByKeywordQuery<T>(
  rows: readonly T[],
  getKeyword: (row: T) => unknown,
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...rows];
  }
  return rows.filter((row) =>
    formatKeywordLabel(getKeyword(row)).toLowerCase().includes(normalized),
  );
}

/** Normalise un nom de thématique (vide → null). */
export function normalizeThemeName(
  theme: string | undefined | null,
): string | null {
  const trimmed = theme?.trim();
  return trimmed ? trimmed : null;
}

export interface KeywordThemeGroup {
  theme: string | null;
  keywords: UnilizeKeyword[];
}

/** Regroupe les mots-clés par thématique (sans thématique en premier). */
export function groupKeywordsByTheme(
  keywords: readonly UnilizeKeyword[],
): KeywordThemeGroup[] {
  const byTheme = new Map<string, UnilizeKeyword[]>();

  for (const keyword of keywords) {
    const value = keyword.value.trim();
    if (!value) {
      continue;
    }
    const theme = normalizeThemeName(keyword.theme);
    if (!theme) {
      continue;
    }

    const entry: UnilizeKeyword = { value, theme };
    const list = byTheme.get(theme) ?? [];
    list.push(entry);
    byTheme.set(theme, list);
  }

  const groups: KeywordThemeGroup[] = [];
  for (const theme of [...byTheme.keys()].sort((a, b) =>
    a.localeCompare(b, "fr"),
  )) {
    groups.push({ theme, keywords: byTheme.get(theme) ?? [] });
  }

  return groups;
}

/** Liste triée des noms de thématiques présents dans la liste. */
export function listThemeNames(keywords: readonly UnilizeKeyword[]): string[] {
  const names = new Set<string>();
  for (const keyword of keywords) {
    const theme = normalizeThemeName(keyword.theme);
    if (theme) {
      names.add(theme);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, "fr"));
}

/** Section éditable du dialog mots-clés / thématiques. */
export interface KeywordThemeSection {
  id: string;
  name: string;
  raw: string;
}

export function keywordsToThemeEditorState(
  keywords: readonly UnilizeKeyword[],
): KeywordThemeSection[] {
  const groups = groupKeywordsByTheme(keywords);
  const sections = groups
    .filter((group) => group.theme !== null)
    .map((group) => ({
      id: group.theme!,
      name: group.theme!,
      raw: group.keywords.map((keyword) => keyword.value).join("\n"),
    }));

  if (sections.length > 0) {
    return sections;
  }

  return [createEmptyThemeSection()];
}

export function createEmptyThemeSection(name = ""): KeywordThemeSection {
  return {
    id: crypto.randomUUID(),
    name,
    raw: "",
  };
}

function parseKeywordLines(
  raw: string,
  theme: string | undefined,
  seen: Set<string>,
  keywords: UnilizeKeyword[],
): { error: string } | null {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const value of lines) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      return { error: `Mot-clé en double : « ${value} ».` };
    }
    seen.add(key);
    if (!theme) {
      return { error: "Chaque mot-clé doit être rattaché à une thématique." };
    }
    keywords.push({ value, theme });
  }

  return null;
}

/** Sérialise les textareas thématiques en payload API. */
export function parseThemeEditorState(
  themeSections: readonly Pick<KeywordThemeSection, "name" | "raw">[],
): UnilizeKeyword[] | { error: string } {
  const keywords: UnilizeKeyword[] = [];
  const seen = new Set<string>();
  const seenThemeNames = new Set<string>();

  for (const section of themeSections) {
    const theme = normalizeThemeName(section.name);
    const hasKeywords = section.raw.trim().length > 0;

    if (!theme) {
      if (hasKeywords) {
        return {
          error: "Chaque thématique contenant des mots-clés doit avoir un nom.",
        };
      }
      continue;
    }

    const themeKey = theme.toLowerCase();
    if (seenThemeNames.has(themeKey)) {
      return { error: `Thématique en double : « ${theme} ».` };
    }
    seenThemeNames.add(themeKey);

    const themedError = parseKeywordLines(section.raw, theme, seen, keywords);
    if (themedError) {
      return themedError;
    }
  }

  return validateKeywordsPayload(keywords);
}

/** Valide et normalise un payload de mots-clés avant envoi API. */
export function validateKeywordsPayload(
  keywords: readonly UnilizeKeyword[],
): UnilizeKeyword[] | { error: string } {
  if (keywords.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: UnilizeKeyword[] = [];

  for (const keyword of keywords) {
    const value = keyword.value.trim();
    if (!value) {
      return { error: "Chaque mot-clé doit avoir une valeur." };
    }

    const key = value.toLowerCase();
    if (seen.has(key)) {
      return { error: `Mot-clé en double : « ${value} ».` };
    }
    seen.add(key);

    const theme = normalizeThemeName(keyword.theme);
    if (!theme) {
      return { error: "Chaque mot-clé doit être rattaché à une thématique." };
    }
    normalized.push({ value, theme });
  }

  return normalized;
}

/**
 * Parse le JSON `{ value, theme? }[]` soumis par le dialog dashboard.
 */
export function parseKeywordsJson(
  raw: string,
): UnilizeKeyword[] | { error: string } {
  if (!raw.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Format de mots-clés invalide." };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Format de mots-clés invalide." };
  }

  const keywords: UnilizeKeyword[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object" || !("value" in item)) {
      return { error: "Format de mots-clés invalide." };
    }
    const value = String((item as { value: unknown }).value ?? "").trim();
    const themeRaw = (item as { theme?: unknown }).theme;
    const theme =
      themeRaw === undefined || themeRaw === null
        ? undefined
        : String(themeRaw).trim() || undefined;
    if (!theme) {
      return { error: "Chaque mot-clé doit être rattaché à une thématique." };
    }
    keywords.push({ value, theme });
  }

  return validateKeywordsPayload(keywords);
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
    const theme =
      themeByValue.get(keyword.value.toLowerCase()) ??
      normalizeThemeName(keyword.theme);
    if (!theme) {
      return keyword;
    }
    return { value: keyword.value, theme };
  });
}
