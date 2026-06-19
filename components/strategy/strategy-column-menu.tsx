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
  getStrategyOptionalColumns,
  STRATEGY_COLUMN_CHANNEL,
} from "@/lib/strategy/column-presets";
import { STRATEGY_COLUMN_LABELS } from "@/lib/strategy/format-strategy";
import type { AnalysisLens } from "@/types/workspace";

export function StrategyColumnMenu({
  lens,
  extraColumns,
  onToggleColumn,
}: {
  lens: AnalysisLens;
  extraColumns: ReadonlySet<string>;
  onToggleColumn: (columnId: string, checked: boolean) => void;
}) {
  const optionalColumns = getStrategyOptionalColumns(lens);
  const activeCount = optionalColumns.filter((id) => extraColumns.has(id)).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Colonnes
          {activeCount > 0 ? ` (+${activeCount})` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Colonnes supplémentaires</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {optionalColumns.map((columnId) => {
          const channel = STRATEGY_COLUMN_CHANNEL[columnId];
          const channelHint =
            channel === "sea" ? "SEA" : channel === "seo" ? "SEO" : "";
          const label =
            STRATEGY_COLUMN_LABELS[
              columnId as keyof typeof STRATEGY_COLUMN_LABELS
            ] ?? columnId;

          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              checked={extraColumns.has(columnId)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onToggleColumn(columnId, checked === true)
              }
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>{label}</span>
                {channelHint ? (
                  <span className="text-muted-foreground text-[10px] uppercase">
                    {channelHint}
                  </span>
                ) : null}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
