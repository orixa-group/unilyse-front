import { AppPage } from "@/components/layout/app-page";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { PerformancesView } from "@/components/performances/performances-view";

export default function PerformancesPage() {
  return (
    <AppPage
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PerformancePeriodPicker />
        </div>
      }
    >
      <PerformancesView />
    </AppPage>
  );
}
