import {
  formatKeywordLabel,
  filterRowsByKeywordQuery,
  normalizeThemeName,
} from "@/lib/projects/keywords";
import type { UnilizeKeyword } from "@/types/unilize";

export function buildKeywordThemeMap(
  keywords: readonly UnilizeKeyword[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of keywords) {
    const value = formatKeywordLabel(entry.value);
    const theme = normalizeThemeName(entry.theme);
    if (value !== "—" && theme) {
      map.set(value, theme);
    }
  }
  return map;
}

export function filterRowsByThemeAndKeyword<T>(
  rows: readonly T[],
  getKeyword: (row: T) => unknown,
  themeMap: Map<string, string>,
  selectedTheme: string | null,
  selectedKeyword: string | null,
  keywordQuery: string,
): T[] {
  let next = [...rows];
  if (selectedTheme) {
    next = next.filter((row) => {
      const label = formatKeywordLabel(getKeyword(row));
      return themeMap.get(label) === selectedTheme;
    });
  }
  if (selectedKeyword) {
    next = next.filter(
      (row) => formatKeywordLabel(getKeyword(row)) === selectedKeyword,
    );
  }
  return filterRowsByKeywordQuery(next, getKeyword, keywordQuery);
}

export function keywordOptionsForFunnel(
  keywords: readonly UnilizeKeyword[],
  selectedTheme: string | null,
): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const entry of keywords) {
    const theme = normalizeThemeName(entry.theme);
    if (selectedTheme && theme !== selectedTheme) {
      continue;
    }
    const label = formatKeywordLabel(entry.value);
    if (label === "—" || seen.has(label)) {
      continue;
    }
    seen.add(label);
    options.push({ value: label, label });
  }
  options.sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return options;
}
