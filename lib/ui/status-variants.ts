import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

export type StatusKind =
  | "optimized"
  | "under_optimized"
  | "target"
  | "consider"
  | "ignore"
  | "critical"
  | "medium"
  | "low"
  | "seo"
  | "sea"
  | "hybrid"
  | "default";

const STATUS_VARIANT_MAP: Record<
  StatusKind,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  optimized: "secondary",
  under_optimized: "outline",
  target: "default",
  consider: "secondary",
  ignore: "outline",
  critical: "destructive",
  medium: "secondary",
  low: "outline",
  seo: "secondary",
  sea: "default",
  hybrid: "outline",
  default: "outline",
};

const STATUS_LABELS: Record<StatusKind, string> = {
  optimized: "Optimisé",
  under_optimized: "Sous-optimisé",
  target: "Cibler",
  consider: "À évaluer",
  ignore: "Ignorer",
  critical: "Critique",
  medium: "Moyenne",
  low: "Faible",
  seo: "SEO",
  sea: "SEA",
  hybrid: "SEO + SEA",
  default: "—",
};

export function resolveStatusVariant(
  kind: StatusKind,
): VariantProps<typeof badgeVariants>["variant"] {
  return STATUS_VARIANT_MAP[kind] ?? "outline";
}

export function resolveStatusLabel(kind: StatusKind): string {
  return STATUS_LABELS[kind] ?? kind;
}
