import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function AuthLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Chargement de la page">
      <LoadingSkeleton className="h-10 w-full max-w-md" />
      <LoadingSkeleton className="h-6 w-full max-w-2xl" />
      <LoadingSkeleton className="h-48 w-full" />
    </div>
  );
}
