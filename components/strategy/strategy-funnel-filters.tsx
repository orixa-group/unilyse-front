"use client";

import { Autocomplete } from "@/components/ui/autocomplete";
import { KeywordTableFilter } from "@/components/ui/keyword-table-filter";
import { keywordOptionsForFunnel } from "@/lib/projects/funnel-filter";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { useSelectionStore } from "@/stores/selection.store";
import type { UnilizeKeyword } from "@/types/unilize";

export function StrategyFunnelFilters({
  keywords,
  themeOptions,
  keywordQuery,
  onKeywordQueryChange,
  disabled,
}: {
  keywords: readonly UnilizeKeyword[];
  themeOptions: { value: string; label: string }[];
  keywordQuery: string;
  onKeywordQueryChange: (value: string) => void;
  disabled?: boolean;
}) {
  const selectedTheme = useSelectionStore((s) => s.selectedTheme);
  const setSelectedTheme = useSelectionStore((s) => s.setSelectedTheme);
  const selectedKeyword = useSelectionStore((s) => s.selectedKeyword);
  const setSelectedKeyword = useSelectionStore((s) => s.setSelectedKeyword);

  const keywordOptions = keywordOptionsForFunnel(keywords, selectedTheme);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[180px] flex-1">
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
      <div className="min-w-[180px] flex-1">
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
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium">
          Recherche
        </p>
        <KeywordTableFilter
          value={keywordQuery}
          onChange={onKeywordQueryChange}
          disabled={disabled}
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
