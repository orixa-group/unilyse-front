import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-xl border p-4" aria-busy="true">
      <LoadingSkeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <LoadingSkeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
