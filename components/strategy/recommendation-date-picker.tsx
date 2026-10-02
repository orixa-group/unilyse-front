"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateIso,
  getPeriodEndDate,
  parseDateIso,
} from "@/lib/performances/period-presets";
import { resolveEffectiveRecommendationDate } from "@/lib/unilize/recommendations-query";
import { useSelectionStore } from "@/stores/selection.store";
import { cn } from "@/lib/utils/cn";

export function RecommendationDatePicker({
  className,
}: {
  className?: string;
}) {
  const recommendationAsOfDate = useSelectionStore(
    (s) => s.recommendationAsOfDate,
  );
  const setRecommendationAsOfDate = useSelectionStore(
    (s) => s.setRecommendationAsOfDate,
  );
  const periodFrom = useSelectionStore((s) => s.periodFrom);
  const periodTo = useSelectionStore((s) => s.periodTo);
  const [open, setOpen] = useState(false);

  const effectiveIso = useMemo(
    () =>
      resolveEffectiveRecommendationDate({
        recommendationAsOfDate,
        period: { from: periodFrom ?? undefined, until: periodTo ?? undefined },
      }),
    [recommendationAsOfDate, periodFrom, periodTo],
  );

  const selected = parseDateIso(effectiveIso) ?? undefined;

  const label = selected
    ? format(selected, "d MMM yyyy", { locale: fr })
    : "Analyses au";

  const handleSelect = (day: Date | undefined) => {
    if (!day) return;
    setRecommendationAsOfDate(formatDateIso(day));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("justify-start gap-2 font-normal", className)}
          aria-label="Date de lecture des analyses"
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          <span className="truncate">
            Analyses au · {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected ?? getPeriodEndDate()}
          locale={fr}
          disabled={{ after: new Date() }}
        />
        <div className="border-border border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full justify-start"
            onClick={() => {
              setRecommendationAsOfDate(null);
              setOpen(false);
            }}
          >
            Par défaut (fin de période performances)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
