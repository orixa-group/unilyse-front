import { AppPage } from "@/components/layout/app-page";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { RecommendationDatePicker } from "@/components/strategy/recommendation-date-picker";
import { StrategyHubView } from "@/components/strategy/strategy-hub-view";

export default function StrategyPage() {
  return (
    <AppPage
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PerformancePeriodPicker />
          <RecommendationDatePicker />
        </div>
      }
    >
      <StrategyHubView />
    </AppPage>
  );
}
