import { StatCard } from "@/components/ui/stat-card";

export function DashboardHealthSummary({
  projectCount,
  keywordCount,
}: {
  projectCount: number;
  keywordCount: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatCard label="Projets" value={projectCount} />
      <StatCard label="Mots-clés suivis" value={keywordCount} />
    </div>
  );
}
