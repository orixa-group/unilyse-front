"use client";

import { useState } from "react";
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
  PERFORMANCE_COLUMN_LABELS,
  PERFORMANCE_COLUMN_PRESET_LABELS,
  PERFORMANCE_COLUMN_PRESET_ORDER,
  PERFORMANCE_TOGGLEABLE_COLUMNS,
  matchPerformanceColumnPreset,
  type PerformanceColumnPresetId,
} from "@/lib/performances/column-presets";
import { cn } from "@/lib/utils/cn";

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
  const [open, setOpen] = useState(false);
  const activePreset = matchPerformanceColumnPreset(visibleColumns);
  const triggerLabel = activePreset
    ? `Colonnes · ${PERFORMANCE_COLUMN_PRESET_LABELS[activePreset]}`
    : `Colonnes (${visibleColumns.size})`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {onApplyPreset ? (
          <>
            <DropdownMenuLabel>Presets</DropdownMenuLabel>
            <div className="flex flex-col gap-1 px-2 pb-2">
              {PERFORMANCE_COLUMN_PRESET_ORDER.map((presetId) => {
                const isActive = activePreset === presetId;
                return (
                  <Button
                    key={presetId}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-8 w-full justify-between px-3 text-xs font-medium",
                      isActive && "pointer-events-none",
                    )}
                    aria-pressed={isActive}
                    onClick={() => {
                      onApplyPreset(presetId);
                      setOpen(false);
                    }}
                  >
                    <span>{PERFORMANCE_COLUMN_PRESET_LABELS[presetId]}</span>
                    {isActive ? (
                      <span className="text-[10px] font-normal opacity-90">
                        Actif
                      </span>
                    ) : null}
                  </Button>
                );
              })}
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
              onClick={() => {
                onReset();
                setOpen(false);
              }}
            >
              Réinitialiser (Essentiel)
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
