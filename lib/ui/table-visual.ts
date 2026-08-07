import { cn } from "@/lib/utils/cn";
import { competitorCountTone, volumeTone } from "@/lib/ui/metric-tone";

export type ShareSeverity = "low" | "medium" | "high";

export type ShareBarVariant = "lost" | "won";

/** Part d'impressions perdues (0–1) → niveau d'alerte (élevé = mauvais). */
export function getShareSeverity(share: number | null | undefined): ShareSeverity | null {
  if (share === null || share === undefined || Number.isNaN(share)) {
    return null;
  }
  if (share >= 0.35) {
    return "high";
  }
  if (share >= 0.15) {
    return "medium";
  }
  return "low";
}

/**
 * Part d'impressions obtenue (0–1) → niveau (élevé = bon).
 * Seuils miroir de getShareSeverity.
 */
export function getWonShareSeverity(
  share: number | null | undefined,
): ShareSeverity | null {
  if (share === null || share === undefined || Number.isNaN(share)) {
    return null;
  }
  if (share >= 0.35) {
    return "high";
  }
  if (share >= 0.15) {
    return "medium";
  }
  return "low";
}

/** Couleurs pour part perdue : high = rouge. */
export const SHARE_BAR_CLASS: Record<ShareSeverity, string> = {
  low: "bg-chart-2",
  medium: "bg-warning",
  high: "bg-destructive",
};

export const SHARE_TEXT_CLASS: Record<ShareSeverity, string> = {
  low: "text-muted-foreground",
  medium: "text-warning dark:text-warning",
  high: "text-destructive dark:text-destructive font-medium",
};

/** Couleurs pour part obtenue : high = vert. */
export const WON_SHARE_BAR_CLASS: Record<ShareSeverity, string> = {
  low: "bg-destructive",
  medium: "bg-warning",
  high: "bg-success",
};

export const WON_SHARE_TEXT_CLASS: Record<ShareSeverity, string> = {
  low: "text-destructive dark:text-destructive",
  medium: "text-warning dark:text-warning",
  high: "text-success dark:text-success font-medium",
};

export type TableChannel = "common" | "sea" | "seo";

export const CHANNEL_HEAD_CLASS: Record<TableChannel, string> = {
  common: "",
  sea: "bg-chart-1/10 border-l-2 border-l-chart-1",
  seo: "bg-chart-3/10 border-l-2 border-l-chart-3",
};

/** Couleurs canal pour le tableau Stratégie — SEO en bleu (info), SEA en violet (chart-1). */
export const STRATEGY_CHANNEL_HEAD_CLASS: Record<TableChannel, string> = {
  common: "",
  sea: "bg-chart-1/10 border-l-2 border-l-chart-1",
  seo: "bg-info/10 border-l-2 border-l-info",
};

export type StickyColumnTone = "header" | "default" | "striped" | "highlight";

/** Position et ombre pour la première colonne figée au scroll horizontal. */
export const STICKY_COLUMN_POSITION =
  "sticky left-0 z-20 dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)]";

const STICKY_COLUMN_BG: Record<StickyColumnTone, string> = {
  header: "bg-muted",
  default: "bg-card",
  striped:
    "bg-[color-mix(in_srgb,hsl(var(--muted))_40%,hsl(var(--card)))]",
  highlight:
    "bg-[color-mix(in_srgb,hsl(var(--success))_12%,hsl(var(--card)))]",
};

export function stickyFirstColumnClass(tone: StickyColumnTone): string {
  return cn(STICKY_COLUMN_POSITION, STICKY_COLUMN_BG[tone]);
}

export function stickyBodyColumnClass(
  rowIndex: number,
  options?: { highlight?: boolean },
): string {
  if (options?.highlight) {
    return stickyFirstColumnClass("highlight");
  }
  return stickyFirstColumnClass(rowIndex % 2 === 1 ? "striped" : "default");
}

/** @deprecated Préférer stickyFirstColumnClass() ou stickyBodyColumnClass(). */
export const STICKY_KEYWORD_CELL = stickyFirstColumnClass("default");

export function getVolumeHeatClass(value: number | null | undefined): string {
  return volumeTone(value);
}

export function getCompetitorHeatClass(count: number): string {
  return competitorCountTone(count);
}
