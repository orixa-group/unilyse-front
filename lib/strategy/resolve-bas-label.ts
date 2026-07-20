import {
  formatAuthorityScoreLabel,
  formatOptimizationStatus,
} from "@/lib/strategy/format-bas";
import type { UnilizeStrategySeo } from "@/types/strategy";

export function resolveStrategyAuthorityLabel(
  seo: UnilizeStrategySeo | null | undefined,
): string | null {
  if (!seo) {
    return null;
  }
  return formatAuthorityScoreLabel(seo.authority_status);
}

export function resolveStrategySemanticLabel(
  seo: UnilizeStrategySeo | null | undefined,
): string | null {
  if (!seo) {
    return null;
  }
  return formatOptimizationStatus(seo.semantic_status);
}
