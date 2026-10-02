import { AppPage } from "@/components/layout/app-page";
import { RecommendationDatePicker } from "@/components/strategy/recommendation-date-picker";
import { StrategyWorkPage } from "@/components/strategy/strategy-work-page";

export default function StrategyContentPage() {
  return (
    <AppPage actions={<RecommendationDatePicker />}>
      <StrategyWorkPage mode="semantic" />
    </AppPage>
  );
}
