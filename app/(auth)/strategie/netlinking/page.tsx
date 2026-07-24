import { AppPage } from "@/components/layout/app-page";
import {
  STRATEGY_NETLINKING_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";

export default function StrategyNetlinkingPage() {
  return (
    <AppPage>
      <StrategyWorkPanel
        title="Mots-clés à travailler via le netlinking"
        columns={STRATEGY_NETLINKING_COLUMNS}
      />
    </AppPage>
  );
}
