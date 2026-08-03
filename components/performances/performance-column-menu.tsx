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
  DEFAULT_PERFORMANCE_VISIBLE_COLUMNS,
  PERFORMANCE_COLUMN_LABELS,
  PERFORMANCE_COLUMN_PRESET_LABELS,
  PERFORMANCE_COLUMN_PRESETS,
  PERFORMANCE_TOGGLEABLE_COLUMNS,
  type PerformanceColumnPresetId,
} from "@/lib/performances/column-presets";

const PRESET_ORDER: PerformanceColumnPresetId[] = [
  "essentiel",
  "sea",
  "seo",
];

export function PerformanceColumnMenu({
  visibleColumns,
  onToggleColumn,
  onApplyPreset,
  onReset,
}: {
  visibleColumns: ReadonlySet<string>;
  onToggleColumn: (columnId: string, checked: boolean) => void;
  onApplyPreset?: (presetId: PerformanceColumnPresetId) => void;
  onReset?: () => void;
}) {
  const activeCount = PERFORMANCE_TOGGLEABLE_COLUMNS.filter((id) =>
    visibleColumns.has(id),
  ).length;
  const isDefault =
    activeCount === DEFAULT_PERFORMANCE_VISIBLE_COLUMNS.length &&
    DEFAULT_PERFORMANCE_VISIBLE_COLUMNS.every((id) => visibleColumns.has(id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Colonnes
          {!isDefault ? ` (${activeCount})` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {onApplyPreset ? (
          <>
            <DropdownMenuLabel>Presets</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-2 pb-1">
              {PRESET_ORDER.map((presetId) => (
                <Button
                  key={presetId}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => onApplyPreset(presetId)}
                >
                  {PERFORMANCE_COLUMN_PRESET_LABELS[presetId]}
                </Button>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PERFORMANCE_TOGGLEABLE_COLUMNS.map((columnId) => {
          const label = PERFORMANCE_COLUMN_LABELS[columnId] ?? columnId;
          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              checked={visibleColumns.has(columnId)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onToggleColumn(columnId, checked === true)
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {onReset ? (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full rounded-sm px-2 py-1.5 text-left text-xs"
              onClick={onReset}
            >
              Réinitialiser (Essentiel)
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
