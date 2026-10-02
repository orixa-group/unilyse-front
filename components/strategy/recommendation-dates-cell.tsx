"use client";

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function formatShortDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  try {
    const d = parseISO(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return format(d, "d MMM yyyy", { locale: fr });
  } catch {
    return iso;
  }
}

export function RecommendationDatesCell({
  analyzedOn,
  measureFrom,
  measureUntil,
}: {
  analyzedOn: string | null | undefined;
  measureFrom: string | null | undefined;
  measureUntil: string | null | undefined;
}) {
  if (!analyzedOn && !measureFrom && !measureUntil) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <dl className="min-w-[10rem] space-y-1.5 text-sm leading-relaxed">
      <div className="flex gap-3">
        <dt className="text-muted-foreground w-[3.5rem] shrink-0">Analyse</dt>
        <dd className="tabular-nums">{formatShortDate(analyzedOn)}</dd>
      </div>
      <div className="flex gap-3">
        <dt className="text-muted-foreground w-[3.5rem] shrink-0">Mesure</dt>
        <dd className="tabular-nums leading-snug">
          {measureFrom && measureUntil
            ? `${formatShortDate(measureFrom)} → ${formatShortDate(measureUntil)}`
            : "—"}
        </dd>
      </div>
    </dl>
  );
}
