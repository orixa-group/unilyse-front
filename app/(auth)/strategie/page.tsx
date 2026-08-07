import { AppPage } from "@/components/layout/app-page";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { StrategyView } from "@/components/strategy/strategy-view";

export default function StrategyPage() {
  return (
    <AppPage actions={<PerformancePeriodPicker />}>
      <StrategyView />
    </AppPage>
  );
}
