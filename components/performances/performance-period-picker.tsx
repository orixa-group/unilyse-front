"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { isBefore, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DEFAULT_PERIOD_PRESET_ID,
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

/** Ordonne deux dates en borne from/to (indépendamment de l’ordre des clics). */
function orderedPeriod(a: Date, b: Date): { from: string; to: string } {
  if (isBefore(b, a)) {
    return { from: formatDateIso(b), to: formatDateIso(a) };
  }
  return { from: formatDateIso(a), to: formatDateIso(b) };
}

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

  const activePreset =
    matchPreset(periodFrom, periodTo) ??
    (!periodFrom && !periodTo ? DEFAULT_PERIOD_PRESET_ID : null);
  const label = formatPeriodLabel(periodFrom, periodTo);

  const applyPreset = (id: PeriodPresetId) => {
    const { from, to } = resolvePresetRange(id);
    setPeriod(formatDateIso(from), formatDateIso(to));
    setOpen(false);
  };

  const handleSelect = (
    _range: DateRange | undefined,
    selectedDay: Date,
  ) => {
    const prevFrom = parseDateIso(periodFrom);
    const prevTo = parseDateIso(periodTo);

    // Plage déjà complète → le clic repart sur une nouvelle ancre.
    if (prevFrom && prevTo) {
      setPeriod(formatDateIso(selectedDay), null);
      return;
    }

    // Une ancre déjà posée → 2e clic : from/to selon l’ordre chronologique.
    if (prevFrom && !prevTo) {
      if (isSameDay(selectedDay, prevFrom)) {
        setPeriod(formatDateIso(selectedDay), formatDateIso(selectedDay));
        return;
      }
      const { from, to } = orderedPeriod(prevFrom, selectedDay);
      setPeriod(from, to);
      return;
    }

    if (!prevFrom && prevTo) {
      if (isSameDay(selectedDay, prevTo)) {
        setPeriod(formatDateIso(selectedDay), formatDateIso(selectedDay));
        return;
      }
      const { from, to } = orderedPeriod(selectedDay, prevTo);
      setPeriod(from, to);
      return;
    }

    // Aucune borne → 1er clic = ancre (from ou to selon le prochain clic).
    setPeriod(formatDateIso(selectedDay), null);
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
                <span>{preset.label}</span>
                {preset.id === DEFAULT_PERIOD_PRESET_ID ? (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-normal",
                      activePreset === preset.id
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    défaut
                  </span>
                ) : null}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selectedRange}
            onSelect={handleSelect}
            resetOnSelect
            defaultMonth={selectedRange?.from ?? selectedRange?.to}
            locale={fr}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
