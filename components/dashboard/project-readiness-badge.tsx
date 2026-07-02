"use client";

import { Badge } from "@/components/ui/badge";
import {
  getProjectReadinessMeta,
  type ProjectReadiness,
} from "@/lib/projects/project-readiness";
import { cn } from "@/lib/utils/cn";

const TONE_CLASS: Record<
  ReturnType<typeof getProjectReadinessMeta>["tone"],
  string
> = {
  warning:
    "border-warning/50 bg-warning/15 text-warning-foreground hover:bg-warning/15",
  info: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/10",
  success:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15",
  muted: "border-border bg-muted text-muted-foreground hover:bg-muted",
};

export function ProjectReadinessBadge({
  readiness,
  className,
}: {
  readiness: ProjectReadiness;
  className?: string;
}) {
  const meta = getProjectReadinessMeta(readiness);

  return (
    <Badge
      variant="outline"
      className={cn(
        "max-w-[11rem] truncate text-[10px] font-semibold uppercase tracking-wide",
        TONE_CLASS[meta.tone],
        className,
      )}
      title={meta.description}
    >
      {meta.label}
    </Badge>
  );
}
