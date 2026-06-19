"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useSelectionStore } from "@/stores/selection.store";
import {
  ANALYSIS_LENS_LABELS,
  type AnalysisLens,
} from "@/types/workspace";

const LENS_OPTIONS: AnalysisLens[] = ["sea", "seo"];

export function StrategyLensToggle() {
  const analysisLens = useSelectionStore((s) => s.analysisLens);
  const setAnalysisLens = useSelectionStore((s) => s.setAnalysisLens);

  return (
    <div
      className="bg-muted/40 flex shrink-0 rounded-lg border p-1"
      role="group"
      aria-label="Vue canal stratégie"
    >
      {LENS_OPTIONS.map((lens) => (
        <Button
          key={lens}
          type="button"
          size="sm"
          variant={analysisLens === lens ? "default" : "ghost"}
          className={cn(
            "h-8 min-w-[3.5rem] px-3",
            analysisLens === lens && "shadow-sm",
          )}
          onClick={() => setAnalysisLens(lens)}
        >
          {ANALYSIS_LENS_LABELS[lens]}
        </Button>
      ))}
    </div>
  );
}
