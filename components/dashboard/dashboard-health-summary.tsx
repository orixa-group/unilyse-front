import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils/cn";

export function DashboardHealthSummary({
  projectCount,
  campaignCount,
  keywordCount,
  projectsWithoutCampaign,
}: {
  projectCount: number;
  campaignCount: number;
  keywordCount: number;
  projectsWithoutCampaign: number;
}) {
  const showAlert = projectsWithoutCampaign > 0;

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        showAlert ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      <StatCard label="Projets" value={projectCount} />
      <StatCard label="Campagnes liées" value={campaignCount} />
      <StatCard label="Mots-clés suivis" value={keywordCount} />
      {showAlert ? (
        <StatCard
          label="Projets sans campagne"
          value={projectsWithoutCampaign}
          tone="warning"
          hint="Liez une campagne Google Ads"
        />
      ) : null}
    </div>
  );
}
