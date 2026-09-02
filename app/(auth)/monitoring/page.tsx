import { AppPage } from "@/components/layout/app-page";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { MonitoringView } from "@/components/monitoring/monitoring-view";

export default function MonitoringPage() {
  return (
    <AppPage actions={<PerformancePeriodPicker />}>
      <MonitoringView />
    </AppPage>
  );
}
