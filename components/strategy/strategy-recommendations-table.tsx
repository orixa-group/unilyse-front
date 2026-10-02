"use client";

import { MetricHeader } from "@/components/performances/metric-header";
import { RecommendationActionCell } from "@/components/strategy/recommendation-action-cell";
import { RecommendationDatesCell } from "@/components/strategy/recommendation-dates-cell";
import { ShareBar } from "@/components/ui/share-bar";
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
  formatUnilizeRating,
  unilizeRatingToneKey,
} from "@/lib/strategy/format-assessments";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import {
  authorityGapTone,
  delayStatusTone,
  numericScoreTone,
  paidConversionsTone,
  scoringLevelTone,
  seaTierTone,
  semanticGapTone,
  volumeTone,
} from "@/lib/ui/metric-tone";
import {
  stickyBodyColumnClass,
  stickyHeaderCellClass,
  stickyHeaderFirstColumnClass,
} from "@/lib/ui/table-visual";
import {
  formatCurrencyEur,
  formatDecimal,
  formatNumber,
} from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type { UnilizeKeywordRecommendation } from "@/types/recommendations";

function TonedLabel({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  if (label === "—" || !tone) {
    return <span className="text-muted-foreground">{label}</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex rounded px-1.5 py-0.5 text-xs font-normal",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function ScoreCell({ value }: { value: number | null | undefined }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex rounded px-1.5 py-0.5 tabular-nums",
        numericScoreTone(value),
      )}
    >
      {formatDecimal(value)}
    </span>
  );
}

const headCellClass = "px-4 py-3 align-middle";
const bodyCellClass = "px-4 py-3.5 align-middle";

export function StrategyRecommendationsTable({
  rows,
}: {
  rows: readonly UnilizeKeywordRecommendation[];
  /** @deprecated Lecture affichée dans l'en-tête du tableau. */
  readAsOf?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted hover:bg-muted">
          <TableHead
            className={cn(
              "min-w-[10rem]",
              headCellClass,
              stickyHeaderFirstColumnClass(),
            )}
          >
            <MetricHeader label="Mot-clé" metricId="keyword" />
          </TableHead>
          <TableHead
            className={cn("min-w-[10rem]", headCellClass, stickyHeaderCellClass())}
          >
            <MetricHeader label="Recommandation" metricId="recommendation" />
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Délai
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Gain pot.
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Conv. SEA
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            <MetricHeader label="Pertinence" metricId="ad_relevance" />
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            <MetricHeader label="CTR attendu" metricId="expected_ctr" />
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            <MetricHeader label="UX landing" metricId="landing_page_ux" />
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Effort
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Écart contenu
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Écart autorité
          </TableHead>
          <TableHead
            className={cn("text-right", headCellClass, stickyHeaderCellClass())}
          >
            <MetricHeader label="Volume rech." metricId="search_volume" />
          </TableHead>
          <TableHead
            className={cn("min-w-[11rem]", headCellClass, stickyHeaderCellClass())}
          >
            Dates
          </TableHead>
          <TableHead
            className={cn("text-right", headCellClass, stickyHeaderCellClass())}
          >
            Score SEA
          </TableHead>
          <TableHead
            className={cn("text-right min-w-[6rem]", headCellClass, stickyHeaderCellClass())}
          >
            Part impr.
          </TableHead>
          <TableHead
            className={cn("text-right", headCellClass, stickyHeaderCellClass())}
          >
            CPC
          </TableHead>
          <TableHead
            className={cn("text-right", headCellClass, stickyHeaderCellClass())}
          >
            Score SEO
          </TableHead>
          <TableHead
            className={cn("text-right", headCellClass, stickyHeaderCellClass())}
          >
            Pos. moy.
          </TableHead>
          <TableHead className={cn(headCellClass, stickyHeaderCellClass())}>
            Budget inj.
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => {
          const reco = row.recommendation;
          const paid = reco?.paid;
          const organic = reco?.organic;
          const sticky = stickyBodyColumnClass(rowIndex);

          return (
            <TableRow
              key={row.keyword}
              className={cn(rowIndex % 2 === 1 && "bg-muted/40")}
            >
              <TableCell className={cn(bodyCellClass, "font-medium", sticky)}>
                {formatKeywordLabel(row.keyword)}
              </TableCell>
              <TableCell className={bodyCellClass}>
                {reco ? (
                  <RecommendationActionCell
                    action={reco.action}
                    reason={reco.reason}
                    guidance={reco.guidance}
                  />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatDelayStatus(organic?.delay)}
                  tone={delayStatusTone(organic?.delay)}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatAssessmentLevel(organic?.potential_gain)}
                  tone={scoringLevelTone(organic?.potential_gain, "positive")}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatPaidConversions(paid?.conversions)}
                  tone={paidConversionsTone(paid?.conversions)}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatUnilizeRating(paid?.ad_relevance)}
                  tone={seaTierTone(unilizeRatingToneKey(paid?.ad_relevance))}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatUnilizeRating(paid?.expected_ctr)}
                  tone={seaTierTone(unilizeRatingToneKey(paid?.expected_ctr))}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatUnilizeRating(paid?.landing_page_ux)}
                  tone={seaTierTone(
                    unilizeRatingToneKey(paid?.landing_page_ux),
                  )}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatAssessmentLevel(organic?.effort)}
                  tone={scoringLevelTone(organic?.effort, "cost")}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatSemanticGap(organic?.semantic_gap)}
                  tone={semanticGapTone(organic?.semantic_gap)}
                />
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatAuthorityGap(organic?.authority_gap)}
                  tone={authorityGapTone(organic?.authority_gap)}
                />
              </TableCell>
              <TableCell className={cn(bodyCellClass, "text-right tabular-nums")}>
                {reco?.search_volume != null ? (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5",
                      volumeTone(reco.search_volume),
                    )}
                  >
                    {formatNumber(reco.search_volume)}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className={bodyCellClass}>
                <RecommendationDatesCell
                  analyzedOn={reco?.analyzed_on}
                  measureFrom={reco?.from}
                  measureUntil={reco?.until}
                />
              </TableCell>
              <TableCell className={cn(bodyCellClass, "text-right")}>
                <ScoreCell value={paid?.score} />
              </TableCell>
              <TableCell className={cn(bodyCellClass, "text-right")}>
                <ShareBar
                  value={paid?.impression_share}
                  variant="won"
                />
              </TableCell>
              <TableCell
                className={cn(bodyCellClass, "text-right tabular-nums text-sm")}
              >
                {paid?.cpc != null && Number.isFinite(paid.cpc)
                  ? formatCurrencyEur(paid.cpc)
                  : "—"}
              </TableCell>
              <TableCell className={cn(bodyCellClass, "text-right")}>
                <ScoreCell value={organic?.score} />
              </TableCell>
              <TableCell
                className={cn(bodyCellClass, "text-right tabular-nums text-sm")}
              >
                {organic?.average_position != null &&
                Number.isFinite(organic.average_position)
                  ? formatDecimal(organic.average_position)
                  : "—"}
              </TableCell>
              <TableCell className={bodyCellClass}>
                <TonedLabel
                  label={formatInjectableBudget(paid?.injectable_budget)}
                  tone={scoringLevelTone(
                    paid?.injectable_budget === "high"
                      ? "high"
                      : paid?.injectable_budget === "moderate"
                        ? "medium"
                        : paid?.injectable_budget === "low"
                          ? "low"
                          : null,
                    "positive",
                  )}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
