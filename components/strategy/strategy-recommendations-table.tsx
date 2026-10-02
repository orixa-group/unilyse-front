"use client";

import { RecommendationActionBadge } from "@/components/strategy/recommendation-action-badge";
import { RecommendationKeywordCell } from "@/components/strategy/recommendation-keyword-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatAssessmentLevel,
  formatAuthorityGap,
  formatDelayStatus,
  formatInjectableBudget,
  formatPaidConversions,
  formatSemanticGap,
} from "@/lib/strategy/format-assessments";
import {
  formatCurrencyEur,
  formatDecimal,
  formatNumber,
  formatPercentValue,
} from "@/lib/utils/formatting";
import type { UnilizeKeywordRecommendation } from "@/types/recommendations";

function formatScore(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatNumber(value);
}

function formatDatesCell(
  row: UnilizeKeywordRecommendation,
  readAsOf: string,
): string {
  const reco = row.recommendation;
  if (!reco) {
    return `Lecture : ${readAsOf}\nAnalyse : —\nMesure : —`;
  }
  return [
    `Analyse : ${reco.analyzed_on}`,
    `Lecture : ${readAsOf}`,
    `Mesure : ${reco.from} → ${reco.until}`,
  ].join("\n");
}

export function StrategyRecommendationsTable({
  rows,
  readAsOf,
}: {
  rows: readonly UnilizeKeywordRecommendation[];
  readAsOf: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[8rem] sticky left-0 z-10 bg-card">
            Action
          </TableHead>
          <TableHead className="min-w-[9rem]">Mot-clé</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="min-w-[10rem] whitespace-pre-line text-xs">
            Dates
          </TableHead>
          <TableHead className="text-right">Score SEA</TableHead>
          <TableHead className="text-right">Score SEO</TableHead>
          <TableHead className="text-right">Pos. moy.</TableHead>
          <TableHead>Écart contenu</TableHead>
          <TableHead>Écart autorité</TableHead>
          <TableHead>Effort</TableHead>
          <TableHead>Délai</TableHead>
          <TableHead>Gain pot.</TableHead>
          <TableHead>Conv. SEA</TableHead>
          <TableHead>Budget inj.</TableHead>
          <TableHead className="text-right">Part impr.</TableHead>
          <TableHead className="text-right">CPC</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const reco = row.recommendation;
          const paid = reco?.paid;
          const organic = reco?.organic;
          return (
            <TableRow key={row.keyword}>
              <TableCell className="sticky left-0 z-10 bg-card">
                {reco ? (
                  <RecommendationActionBadge action={reco.action} />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <RecommendationKeywordCell
                  keyword={row.keyword}
                  reason={reco?.reason}
                  guidance={reco?.guidance}
                />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {reco?.search_volume != null
                  ? formatNumber(reco.search_volume)
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-pre-line text-xs">
                {formatDatesCell(row, readAsOf)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatScore(paid?.score)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatScore(organic?.score)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-xs">
                {organic?.average_position != null &&
                Number.isFinite(organic.average_position)
                  ? formatDecimal(organic.average_position)
                  : "—"}
              </TableCell>
              <TableCell className="text-xs">
                {formatSemanticGap(organic?.semantic_gap)}
              </TableCell>
              <TableCell className="text-xs">
                {formatAuthorityGap(organic?.authority_gap)}
              </TableCell>
              <TableCell className="text-xs">
                {formatAssessmentLevel(organic?.effort)}
              </TableCell>
              <TableCell className="text-xs">
                {formatDelayStatus(organic?.delay)}
              </TableCell>
              <TableCell className="text-xs">
                {formatAssessmentLevel(organic?.potential_gain)}
              </TableCell>
              <TableCell className="text-xs">
                {formatPaidConversions(paid?.conversions)}
              </TableCell>
              <TableCell className="text-xs">
                {formatInjectableBudget(paid?.injectable_budget)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-xs">
                {paid?.impression_share != null &&
                Number.isFinite(paid.impression_share)
                  ? formatPercentValue(paid.impression_share * 100)
                  : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums text-xs">
                {paid?.cpc != null && Number.isFinite(paid.cpc)
                  ? formatCurrencyEur(paid.cpc)
                  : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
