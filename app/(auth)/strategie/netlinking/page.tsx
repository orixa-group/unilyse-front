"use client";

import { AppPage } from "@/components/layout/app-page";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import {
  STRATEGY_NETLINKING_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";
import { useStrategy } from "@/hooks/use-strategy-api";
import { useProjectContext } from "@/hooks/use-project-context";

export default function StrategyNetlinkingPage() {
  const { canFetchMetrics, selectedProjectId, period } = useProjectContext();
  const {
    data: strategyResult,
    isLoading,
    isError,
    error,
  } = useStrategy(canFetchMetrics ? selectedProjectId : null, period);

  if (isLoading && !strategyResult) {
    return (
      <AppPage>
        <LoadingSkeleton className="h-64 w-full" />
      </AppPage>
    );
  }

  if (isError) {
    return (
      <AppPage>
        <BffErrorAlert
          error={error}
          fallback="Impossible de charger les écarts netlinking."
          title="Netlinking indisponible"
        />
      </AppPage>
    );
  }

  const gaps = strategyResult?.strategy?.netlinking_gaps ?? [];

  return (
    <AppPage>
      <StrategyWorkPanel
        title="Mots-clés à travailler via le netlinking"
        columns={STRATEGY_NETLINKING_COLUMNS}
        rows={gaps}
      />
    </AppPage>
  );
}
