import {
  STRATEGY_CONTENT_COLUMNS,
  STRATEGY_NETLINKING_COLUMNS,
  StrategyWorkPanel,
} from "@/components/strategy/strategy-work-panel";
import { ROUTES } from "@/lib/constants/routes";
import type { StrategyWorkGapRow } from "@/types/strategy-work";

const PREVIEW_LIMIT = 5;

export function StrategyWorkPanels({
  netlinkingRows,
  semanticRows,
}: {
  netlinkingRows: readonly StrategyWorkGapRow[];
  semanticRows: readonly StrategyWorkGapRow[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StrategyWorkPanel
        title="Mots-clés à travailler via le netlinking"
        seeAllHref={ROUTES.STRATEGY_NETLINKING}
        columns={STRATEGY_NETLINKING_COLUMNS}
        rows={netlinkingRows}
        limit={PREVIEW_LIMIT}
      />
      <StrategyWorkPanel
        title="Mots-clés à travailler via le contenu"
        seeAllHref={ROUTES.STRATEGY_CONTENT}
        columns={STRATEGY_CONTENT_COLUMNS}
        rows={semanticRows}
        limit={PREVIEW_LIMIT}
      />
    </div>
  );
}
