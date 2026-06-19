import { Badge } from "@/components/ui/badge";
import {
  resolveStatusLabel,
  resolveStatusVariant,
  type StatusKind,
} from "@/lib/ui/status-variants";
import { cn } from "@/lib/utils/cn";

export function StatusBadge({
  kind,
  label,
  className,
}: {
  kind: StatusKind;
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant={resolveStatusVariant(kind)}
      className={cn("font-normal", className)}
    >
      {label ?? resolveStatusLabel(kind)}
    </Badge>
  );
}
