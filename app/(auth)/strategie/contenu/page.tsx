"use client";

import { AppPage } from "@/components/layout/app-page";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import {
  STRATEGY_CONTENT_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";
import { useStrategy } from "@/hooks/use-strategy-api";
import { useProjectContext } from "@/hooks/use-project-context";

export default function StrategyContentPage() {
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
          fallback="Impossible de charger les écarts contenu."
          title="Contenu indisponible"
        />
      </AppPage>
    );
  }

  const gaps = strategyResult?.strategy?.semantic_gaps ?? [];

  return (
    <AppPage>
      <StrategyWorkPanel
        title="Mots-clés à travailler via le contenu"
        columns={STRATEGY_CONTENT_COLUMNS}
        rows={gaps}
      />
    </AppPage>
  );
}
