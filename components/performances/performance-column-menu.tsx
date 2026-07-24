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
  PERFORMANCE_TOGGLEABLE_COLUMNS,
} from "@/lib/performances/column-presets";

export function PerformanceColumnMenu({
  visibleColumns,
  onToggleColumn,
  onReset,
}: {
  visibleColumns: ReadonlySet<string>;
  onToggleColumn: (columnId: string, checked: boolean) => void;
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
              Réinitialiser (essentielles)
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
