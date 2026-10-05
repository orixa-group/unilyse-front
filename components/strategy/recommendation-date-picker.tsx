"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
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
  const [open, setOpen] = useState(false);

  const effectiveIso = useMemo(
    () =>
      resolveEffectiveRecommendationDate({
        recommendationAsOfDate,
      }),
    [recommendationAsOfDate],
  );

  const selected = parseDateIso(effectiveIso) ?? undefined;
  const today = new Date();

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
          <span className="truncate">Analyses au · {label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected ?? today}
          locale={fr}
          disabled={{ after: today }}
        />
        <div className="border-border p-2">
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
            Aujourd&apos;hui (par défaut)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
