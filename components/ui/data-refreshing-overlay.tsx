"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/cn";

/** Overlay discret pendant un refetch (keepPreviousData) — ne remplace pas le contenu. */
export function DataRefreshingOverlay({
  active,
  children,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative" aria-busy={active || undefined}>
      <div
        className={cn(
          "transition-opacity duration-200",
          active && "pointer-events-none opacity-55",
          className,
        )}
      >
        {children}
      </div>
      {active ? (
        <div
          className="bg-background/40 absolute inset-0 z-10 flex items-start justify-center pt-10 backdrop-blur-[1px]"
          role="status"
          aria-label="Actualisation en cours"
        >
          <span className="bg-card text-muted-foreground border-border inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
              className="animate-spin"
              aria-hidden
            />
            Actualisation…
          </span>
        </div>
      ) : null}
    </div>
  );
}
