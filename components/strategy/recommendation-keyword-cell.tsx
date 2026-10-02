"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { cn } from "@/lib/utils/cn";

export function RecommendationKeywordCell({
  keyword,
  reason,
  guidance,
}: {
  keyword: string;
  reason?: string | null;
  guidance?: string | null;
}) {
  const label = formatKeywordLabel(keyword);
  const hasDetail = Boolean(reason?.trim() || guidance?.trim());

  if (!hasDetail) {
    return <span className="font-medium">{label}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-left font-medium underline decoration-dotted underline-offset-2",
              "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="space-y-2 p-3 text-left">
          {reason?.trim() ? (
            <p>
              <span className="text-foreground font-medium">Pourquoi — </span>
              {reason}
            </p>
          ) : null}
          {guidance?.trim() ? (
            <p>
              <span className="text-foreground font-medium">
                Comment appliquer —{" "}
              </span>
              {guidance}
            </p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
