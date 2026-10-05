"use client";

import { Autocomplete } from "@/components/ui/autocomplete";
import { keywordOptionsForFunnel } from "@/lib/projects/funnel-filter";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizeKeyword } from "@/types/unilize";

export function StrategyFunnelFilters({
  keywords,
  themeOptions,
  disabled,
}: {
  keywords: readonly UnilizeKeyword[];
  themeOptions: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const selectedTheme = useSelectionStore((s) => s.selectedTheme);
  const setSelectedTheme = useSelectionStore((s) => s.setSelectedTheme);
  const selectedKeyword = useSelectionStore((s) => s.selectedKeyword);
  const setSelectedKeyword = useSelectionStore((s) => s.setSelectedKeyword);

  const keywordOptions = keywordOptionsForFunnel(keywords, selectedTheme);

  return (
    <div className="w-1/2 flex items-end gap-4">
      <div className="min-w-[180px] w-1/2">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          Thématique
        </p>
        <Autocomplete
          options={themeOptions}
          value={selectedTheme}
          onValueChange={setSelectedTheme}
          placeholder="Toutes les thématiques"
          clearable
          clearLabel="Toutes"
          disabled={disabled}
          aria-label="Filtrer par thématique"
        />
      </div>
      <div className="min-w-[180px] w-1/2">
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          Mot-clé
        </p>
        <Autocomplete
          options={keywordOptions}
          value={selectedKeyword}
          onValueChange={setSelectedKeyword}
          placeholder="Tous les mots-clés"
          clearable
          clearLabel="Tous"
          disabled={disabled}
          aria-label="Filtrer par mot-clé"
        />
      </div>
    </div>
  );
}

/** Thématiques dérivées des mots-clés projet si la liste API themes est vide. */
export function themeOptionsFromKeywords(
  keywords: readonly UnilizeKeyword[],
): { value: string; label: string }[] {
  const names = new Set<string>();
  for (const kw of keywords) {
    const theme = kw.theme?.trim();
    if (theme) {
      names.add(theme);
    }
  }
  return [...names]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((name) => ({ value: name, label: name }));
}
