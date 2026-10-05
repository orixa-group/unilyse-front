"use client";

import { formatRecommendationDateLabel } from "@/lib/unilize/recommendations-query";
import type { RecommendationTimelineEvent } from "@/lib/strategy/recommendation-events";
import { cn } from "@/lib/utils/cn";

export function TimelineRecommendationEvents({
  events,
  readAsOf,
  className,
}: {
  events: readonly RecommendationTimelineEvent[];
  readAsOf: string;
  className?: string;
}) {
  const dateLabel = formatRecommendationDateLabel(readAsOf);
  const countLabel =
    events.length === 0
      ? "Aucune entrée"
      : `${events.length} entrée${events.length > 1 ? "s" : ""}`;

  return (
    <details
      className={cn(
        "border-border bg-card group rounded-xl border",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 text-left">
          <h2 className="text-foreground text-sm font-medium">
            Analyses &amp; recommandations
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Lecture au {dateLabel} · {countLabel} — recommandations Unilize
            (sans historique des changements)
          </p>
        </div>
        <span
          className="text-muted-foreground shrink-0 text-xs transition-transform group-open:rotate-180"
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <div className="border-border border-t px-4 pb-4 pt-3">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune recommandation pour ce projet à cette date.
          </p>
        ) : (
          <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {events.map((event) => (
              <li
                key={`${event.keyword}-${event.analyzedOn}-${event.action}`}
                className="border-border rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{event.keyword}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatRecommendationDateLabel(event.analyzedOn)}
                  </span>
                </div>
                <p className="text-foreground mt-0.5 text-xs font-medium">
                  {event.actionLabel}
                </p>
                {event.paidReason ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    <span className="font-medium text-chart-1">SEA</span>
                    <span> — </span>
                    {event.paidReason}
                  </p>
                ) : null}
                {event.organicReason ? (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    <span className="font-medium text-chart-2">SEO</span>
                    <span> — </span>
                    {event.organicReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
