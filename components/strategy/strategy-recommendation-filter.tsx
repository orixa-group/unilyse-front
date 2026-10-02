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
import {
  formatRecommendationAction,
  STRATEGY_RECOMMENDATION_FILTER_OPTIONS,
  type StrategyRecommendationFilterValue,
} from "@/lib/strategy/format-recommendations";

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
      ? formatRecommendationAction([...selected][0])
      : `${selected.size} recommandations`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrer par action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={() => selectAll()}
        >
          Toutes
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {STRATEGY_RECOMMENDATION_FILTER_OPTIONS.map((value) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={!allSelected && selected.has(value)}
            onCheckedChange={() => toggle(value)}
          >
            {formatRecommendationAction(value)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
