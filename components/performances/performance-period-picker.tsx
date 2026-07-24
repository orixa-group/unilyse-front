"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PERIOD_PRESETS,
  formatDateIso,
  formatPeriodLabel,
  matchPreset,
  parseDateIso,
  resolvePresetRange,
  type PeriodPresetId,
} from "@/lib/performances/period-presets";
import { useSelectionStore } from "@/stores/selection.store";
import { cn } from "@/lib/utils/cn";
import { fr } from "date-fns/locale";

export function PerformancePeriodPicker({
  className,
}: {
  className?: string;
}) {
  const periodFrom = useSelectionStore((s) => s.periodFrom);
  const periodTo = useSelectionStore((s) => s.periodTo);
  const setPeriod = useSelectionStore((s) => s.setPeriod);
  const [open, setOpen] = useState(false);

  const selectedRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateIso(periodFrom) ?? undefined;
    const to = parseDateIso(periodTo) ?? undefined;
    if (!from && !to) return undefined;
    return { from, to };
  }, [periodFrom, periodTo]);

  const activePreset = matchPreset(periodFrom, periodTo);
  const label = formatPeriodLabel(periodFrom, periodTo);

  const applyPreset = (id: PeriodPresetId) => {
    const { from, to } = resolvePresetRange(id);
    setPeriod(formatDateIso(from), formatDateIso(to));
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setPeriod(null, null);
      return;
    }
    setPeriod(
      formatDateIso(range.from),
      range.to ? formatDateIso(range.to) : formatDateIso(range.from),
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("justify-start gap-2 font-normal", className)}
          aria-label="Sélectionner une période"
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto max-w-[calc(100vw-1rem)] overflow-x-auto p-0"
      >
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4">
          <div className="flex flex-col gap-1 sm:w-40">
            <p className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wide">
              Raccourcis
            </p>
            {PERIOD_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={activePreset === preset.id ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground justify-start"
              onClick={() => setPeriod(null, null)}
            >
              Réinitialiser
            </Button>
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selectedRange}
            onSelect={handleSelect}
            defaultMonth={selectedRange?.from ?? selectedRange?.to}
            locale={fr}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
