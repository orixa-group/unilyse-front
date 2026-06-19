import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded-md",
        className ?? "h-10 w-full",
      )}
    />
  );
}
