import { AppPage } from "@/components/layout/app-page";
import { RecommendationDatePicker } from "@/components/strategy/recommendation-date-picker";
import { StrategyHubView } from "@/components/strategy/strategy-hub-view";

export default function StrategyPage() {
  return (
    <AppPage
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <RecommendationDatePicker />
        </div>
      }
    >
      <StrategyHubView />
    </AppPage>
  );
}
