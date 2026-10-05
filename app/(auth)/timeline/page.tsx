import { AppPage } from "@/components/layout/app-page";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { TimelineView } from "@/components/timeline/timeline-view";

export default function TimelinePage() {
  return (
    <AppPage
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PerformancePeriodPicker />
        </div>
      }
    >
      <TimelineView />
    </AppPage>
  );
}
