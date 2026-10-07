"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MetricHeader } from "@/components/performances/metric-header";
import { RecommendationActionCell } from "@/components/strategy/recommendation-action-cell";
import { RecommendationDatesCell } from "@/components/strategy/recommendation-dates-cell";
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
  formatIncrementalCtr,
  formatInjectableBudget,
  formatPaidConversions,
  formatSemanticGap,
  formatUnilizeRating,
  unilizeRatingToneKey,
} from "@/lib/strategy/format-assessments";
import { formatRecommendationAction } from "@/lib/strategy/format-recommendations";
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
import { formatDecimal, formatNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type { StrategyTableViewMode } from "@/components/strategy/strategy-table-view-toggle";
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

function formatSeoPosition(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return formatNumber(value);
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

const FULL_VIEW_COLUMN_IDS = [
  "dates",
  "search_volume",
  "injectable_budget",
  "conversions",
  "ad_relevance",
  "landing_page_ux",
  "incremental_ctr",
  "average_position",
  "ranking_position",
  "effort",
  "delay",
  "potential_gain",
  "semantic_gap",
  "authority_gap",
] as const;

const RIGHT_ALIGNED_COLUMNS = new Set([
  "paid_score",
  "search_volume",
  "average_position",
  "ranking_position",
  "organic_score",
]);

function compareSortable(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  const missing = (value: string | number | null | undefined) =>
    value == null ||
    value === "" ||
    (typeof value === "number" && !Number.isFinite(value));
  if (missing(a) && missing(b)) return 0;
  if (missing(a)) return 1;
  if (missing(b)) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "fr", {
    numeric: true,
    sensitivity: "base",
  });
}

function labeledOrNull(label: string): string | null {
  return label === "—" ? null : label;
}

function buildColumns(): ColumnDef<UnilizeKeywordRecommendation>[] {
  const sortingFn: ColumnDef<UnilizeKeywordRecommendation>["sortingFn"] = (
    rowA,
    rowB,
    columnId,
  ) =>
    compareSortable(
      rowA.getValue(columnId) as string | number | null,
      rowB.getValue(columnId) as string | number | null,
    );

  return [
    {
      id: "keyword",
      accessorFn: (row) => row.keyword,
      header: () => <MetricHeader label="Mot-clé" metricId="keyword" />,
      sortingFn,
      cell: ({ row }) => formatKeywordLabel(row.original.keyword),
    },
    {
      id: "dates",
      accessorFn: (row) => row.recommendation?.analyzed_on ?? null,
      header: "Dates",
      sortingFn,
      cell: ({ row }) => {
        const reco = row.original.recommendation;
        return (
          <RecommendationDatesCell
            analyzedOn={reco?.analyzed_on}
            measureFrom={reco?.from}
            measureUntil={reco?.until}
          />
        );
      },
    },
    {
      id: "action",
      accessorFn: (row) =>
        row.recommendation
          ? formatRecommendationAction(row.recommendation.action)
          : null,
      header: () => (
        <MetricHeader label="Recommandation" metricId="recommendation" />
      ),
      sortingFn,
      cell: ({ row }) => {
        const reco = row.original.recommendation;
        if (!reco) return "—";
        return (
          <RecommendationActionCell
            action={reco.action}
            paidReason={reco.paid?.reason}
            organicReason={reco.organic?.reason}
            guidance={reco.guidance}
          />
        );
      },
    },
    {
      id: "paid_score",
      accessorFn: (row) => row.recommendation?.paid?.score ?? null,
      header: "Score SEA",
      sortingFn,
      cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
    },
    {
      id: "search_volume",
      accessorFn: (row) => row.recommendation?.search_volume ?? null,
      header: () => (
        <MetricHeader label="Volume rech." metricId="search_volume" />
      ),
      sortingFn,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value == null) return "—";
        return (
          <span className={cn("rounded px-1.5 py-0.5", volumeTone(value))}>
            {formatNumber(value)}
          </span>
        );
      },
    },
    {
      id: "injectable_budget",
      accessorFn: (row) =>
        labeledOrNull(
          formatInjectableBudget(row.recommendation?.paid?.injectable_budget),
        ),
      header: "Budget injecté",
      sortingFn,
      cell: ({ row }) => {
        const budget = row.original.recommendation?.paid?.injectable_budget;
        return (
          <TonedLabel
            label={formatInjectableBudget(budget)}
            tone={scoringLevelTone(
              budget === "high"
                ? "high"
                : budget === "moderate"
                  ? "medium"
                  : budget === "low"
                    ? "low"
                    : null,
              "positive",
            )}
          />
        );
      },
    },
    {
      id: "conversions",
      accessorFn: (row) =>
        labeledOrNull(
          formatPaidConversions(row.recommendation?.paid?.conversions),
        ),
      header: "Conv. SEA",
      sortingFn,
      cell: ({ row }) => {
        const conversions = row.original.recommendation?.paid?.conversions;
        return (
          <TonedLabel
            label={formatPaidConversions(conversions)}
            tone={paidConversionsTone(conversions)}
          />
        );
      },
    },
    {
      id: "ad_relevance",
      accessorFn: (row) =>
        labeledOrNull(
          formatUnilizeRating(row.recommendation?.paid?.ad_relevance),
        ),
      header: () => <MetricHeader label="Pertinence" metricId="ad_relevance" />,
      sortingFn,
      cell: ({ row }) => {
        const rating = row.original.recommendation?.paid?.ad_relevance;
        return (
          <TonedLabel
            label={formatUnilizeRating(rating)}
            tone={seaTierTone(unilizeRatingToneKey(rating))}
          />
        );
      },
    },
    {
      id: "landing_page_ux",
      accessorFn: (row) =>
        labeledOrNull(
          formatUnilizeRating(row.recommendation?.paid?.landing_page_ux),
        ),
      header: () => (
        <MetricHeader label="UX landing" metricId="landing_page_ux" />
      ),
      sortingFn,
      cell: ({ row }) => {
        const rating = row.original.recommendation?.paid?.landing_page_ux;
        return (
          <TonedLabel
            label={formatUnilizeRating(rating)}
            tone={seaTierTone(unilizeRatingToneKey(rating))}
          />
        );
      },
    },
    {
      id: "incremental_ctr",
      accessorFn: (row) =>
        labeledOrNull(
          formatIncrementalCtr(row.recommendation?.paid?.incremental_ctr),
        ),
      header: () => (
        <MetricHeader label="CTR incrément" metricId="incremental_ctr" />
      ),
      sortingFn,
      cell: ({ row }) => (
        <TonedLabel
          label={formatIncrementalCtr(
            row.original.recommendation?.paid?.incremental_ctr,
          )}
          tone=""
        />
      ),
    },
    {
      id: "average_position",
      accessorFn: (row) => row.recommendation?.organic?.average_position ?? null,
      header: () => (
        <MetricHeader label="Pos. moy. SEO" metricId="average_position" />
      ),
      sortingFn,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value != null && Number.isFinite(value)
          ? formatDecimal(value)
          : "—";
      },
    },
    {
      id: "ranking_position",
      accessorFn: (row) => row.recommendation?.organic?.ranking_position ?? null,
      header: () => (
        <MetricHeader label="Position SEO" metricId="real_time_position" />
      ),
      sortingFn,
      cell: ({ getValue }) => formatSeoPosition(getValue() as number | null),
    },
    {
      id: "effort",
      accessorFn: (row) =>
        labeledOrNull(formatAssessmentLevel(row.recommendation?.organic?.effort)),
      header: "Effort",
      sortingFn,
      cell: ({ row }) => {
        const effort = row.original.recommendation?.organic?.effort;
        return (
          <TonedLabel
            label={formatAssessmentLevel(effort)}
            tone={scoringLevelTone(effort, "cost")}
          />
        );
      },
    },
    {
      id: "delay",
      accessorFn: (row) =>
        labeledOrNull(formatDelayStatus(row.recommendation?.organic?.delay)),
      header: "Délai",
      sortingFn,
      cell: ({ row }) => {
        const delay = row.original.recommendation?.organic?.delay;
        return (
          <TonedLabel
            label={formatDelayStatus(delay)}
            tone={delayStatusTone(delay)}
          />
        );
      },
    },
    {
      id: "potential_gain",
      accessorFn: (row) =>
        labeledOrNull(
          formatAssessmentLevel(row.recommendation?.organic?.potential_gain),
        ),
      header: "Gain pot.",
      sortingFn,
      cell: ({ row }) => {
        const gain = row.original.recommendation?.organic?.potential_gain;
        return (
          <TonedLabel
            label={formatAssessmentLevel(gain)}
            tone={scoringLevelTone(gain, "positive")}
          />
        );
      },
    },
    {
      id: "semantic_gap",
      accessorFn: (row) =>
        labeledOrNull(formatSemanticGap(row.recommendation?.organic?.semantic_gap)),
      header: "Écart contenu",
      sortingFn,
      cell: ({ row }) => {
        const gap = row.original.recommendation?.organic?.semantic_gap;
        return (
          <TonedLabel
            label={formatSemanticGap(gap)}
            tone={semanticGapTone(gap)}
          />
        );
      },
    },
    {
      id: "authority_gap",
      accessorFn: (row) =>
        labeledOrNull(
          formatAuthorityGap(row.recommendation?.organic?.authority_gap),
        ),
      header: "Écart autorité",
      sortingFn,
      cell: ({ row }) => {
        const gap = row.original.recommendation?.organic?.authority_gap;
        return (
          <TonedLabel
            label={formatAuthorityGap(gap)}
            tone={authorityGapTone(gap)}
          />
        );
      },
    },
    {
      id: "organic_score",
      accessorFn: (row) => row.recommendation?.organic?.score ?? null,
      header: "Score investissement SEO",
      sortingFn,
      cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
    },
  ];
}

export function StrategyRecommendationsTable({
  rows,
  viewMode = "full",
}: {
  rows: readonly UnilizeKeywordRecommendation[];
  viewMode?: StrategyTableViewMode;
  /** @deprecated Lecture affichée dans l'en-tête du tableau. */
  readAsOf?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(() => buildColumns(), []);
  const columnVisibility = useMemo(() => {
    if (viewMode === "full") return {};
    return Object.fromEntries(
      FULL_VIEW_COLUMN_IDS.map((id) => [id, false]),
    ) as Record<(typeof FULL_VIEW_COLUMN_IDS)[number], boolean>;
  }, [viewMode]);
  const data = useMemo(() => [...rows], [rows]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.keyword,
  });

  return (
    <Table disableContainerScroll>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
            {headerGroup.headers.map((header) => {
              const columnId = header.column.id;
              const sticky = columnId === "keyword";
              const alignRight = RIGHT_ALIGNED_COLUMNS.has(columnId);
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    headCellClass,
                    columnId === "keyword" && "min-w-[10rem]",
                    columnId === "dates" && "min-w-[11rem]",
                    columnId === "action" && "min-w-[10rem]",
                    alignRight && "text-right",
                    sticky
                      ? stickyHeaderFirstColumnClass()
                      : stickyHeaderCellClass(),
                  )}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={cn(
                        "w-full cursor-pointer font-semibold select-none",
                        alignRight ? "text-right" : "text-left",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row, rowIndex) => (
          <TableRow
            key={row.id}
            className={cn(rowIndex % 2 === 1 && "bg-muted/40")}
          >
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              const sticky = columnId === "keyword";
              const alignRight = RIGHT_ALIGNED_COLUMNS.has(columnId);
              const numeric =
                columnId === "search_volume" ||
                columnId === "average_position" ||
                columnId === "ranking_position";
              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    bodyCellClass,
                    sticky && "font-medium",
                    sticky && stickyBodyColumnClass(rowIndex),
                    alignRight && "text-right",
                    numeric && "tabular-nums",
                    (columnId === "average_position" ||
                      columnId === "ranking_position") &&
                      "text-sm",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
