import { AppPage } from "@/components/layout/app-page";
import {
  STRATEGY_CONTENT_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";

export default function StrategyContentPage() {
  return (
    <AppPage>
      <StrategyWorkPanel
        title="Mots-clés à travailler via le contenu"
        columns={STRATEGY_CONTENT_COLUMNS}
      />
    </AppPage>
  );
}
