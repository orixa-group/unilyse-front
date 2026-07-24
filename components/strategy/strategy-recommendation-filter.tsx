"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatStrategyRecommendation } from "@/lib/strategy/format-strategy";
import type { UnilizeStrategyRecommendation } from "@/types/strategy";

export const STRATEGY_RECOMMENDATION_FILTER_OPTIONS = [
  "REVIEW_STRATEGY",
  "MAINTAIN_ADS",
  "LAUNCH_SEO",
  "DOUBLE_PRESENCE",
] as const satisfies readonly UnilizeStrategyRecommendation[];

export type StrategyRecommendationFilterValue =
  (typeof STRATEGY_RECOMMENDATION_FILTER_OPTIONS)[number];

export function StrategyRecommendationFilter({
  selected,
  onChange,
}: {
  selected: ReadonlySet<StrategyRecommendationFilterValue>;
  onChange: (next: Set<StrategyRecommendationFilterValue>) => void;
}) {
  const allSelected = selected.size === 0;

  const selectAll = () => {
    onChange(new Set());
  };

  const toggle = (value: StrategyRecommendationFilterValue) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(next);
  };

  const triggerLabel = allSelected
    ? "Toutes les recommandations"
    : selected.size === 1
      ? formatStrategyRecommendation([...selected][0])
      : `${selected.size} recommandations`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrer par recommandation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={(checked) => {
            if (checked) {
              selectAll();
            }
          }}
        >
          Toutes
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {STRATEGY_RECOMMENDATION_FILTER_OPTIONS.map((value) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={!allSelected && selected.has(value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(value)}
          >
            {formatStrategyRecommendation(value)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
