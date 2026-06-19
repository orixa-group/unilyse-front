"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { MetricHeader } from "@/components/performances/metric-header";
import { OptimizationBadge } from "@/components/strategy/optimization-badge";
import { SeaTierBadge } from "@/components/strategy/sea-tier-badge";
import { StrategyRecommendationBadge } from "@/components/strategy/strategy-recommendation-badge";
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
  getVisibleStrategyColumns,
  STRATEGY_COLUMN_CHANNEL,
} from "@/lib/strategy/column-presets";
import {
  formatPageIntentMatch,
  formatStrategyRecommendation,
  STRATEGY_COLUMN_LABELS,
} from "@/lib/strategy/format-strategy";
import {
  resolveStrategyAuthorityLabel,
  resolveStrategySemanticLabel,
} from "@/lib/strategy/resolve-bas-label";
import {
  pageIntentTone,
  seoPositionTone,
} from "@/lib/ui/metric-tone";
import {
  stickyBodyColumnClass,
  stickyFirstColumnClass,
  STRATEGY_CHANNEL_HEAD_CLASS,
} from "@/lib/ui/table-visual";
import {
  formatCurrencyEur,
  formatDecimal,
  formatPercentValue,
} from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeKeywordComparison,
  UnilizeStrategySeaTier,
} from "@/types/strategy";
import type { AnalysisLens } from "@/types/workspace";

const RECOMMENDATION_KIND: Record<
  string,
  "seo" | "sea" | "hybrid"
> = {
  seo: "seo",
  sea: "sea",
  hybrid: "hybrid",
};

function formatNullablePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return formatPercentValue(value * 100);
}

function formatNullableCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return formatCurrencyEur(value);
}

function buildColumns(): ColumnDef<UnilizeKeywordComparison>[] {
  return [
    {
      id: "keyword",
      accessorKey: "keyword",
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.keyword}
          metricId="keyword"
        />
      ),
      sortingFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    },
    {
      id: "recommendation",
      accessorKey: "recommendation",
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.recommendation}
          metricId="recommendation"
        />
      ),
      cell: ({ getValue }) => {
        const rec = getValue() as UnilizeKeywordComparison["recommendation"];
        if (!rec) {
          return "—";
        }
        const normalized = rec.toLowerCase();
        if (!RECOMMENDATION_KIND[normalized]) {
          return formatStrategyRecommendation(rec);
        }
        return <StrategyRecommendationBadge recommendation={normalized} />;
      },
    },
    {
      id: "budget_lost",
      accessorFn: (row) => row.sea?.search_budget_lost_impression_share ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.budget_lost}
          metricId="budget_lost_impression_share"
        />
      ),
      cell: ({ getValue }) => <ShareBar value={getValue() as number | null} />,
    },
    {
      id: "rank_lost",
      accessorFn: (row) => row.sea?.search_rank_lost_impression_share ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.rank_lost}
          metricId="rank_lost_impression_share"
        />
      ),
      cell: ({ getValue }) => <ShareBar value={getValue() as number | null} />,
    },
    {
      id: "ad_relevance",
      accessorFn: (row) => row.sea?.ad_relevance ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.ad_relevance}
          metricId="ad_relevance"
        />
      ),
      cell: ({ getValue }) => (
        <SeaTierBadge tier={getValue() as UnilizeStrategySeaTier | null} />
      ),
    },
    {
      id: "expected_ctr",
      accessorFn: (row) => row.sea?.expected_ctr ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.expected_ctr}
          metricId="expected_ctr"
        />
      ),
      cell: ({ getValue }) => (
        <SeaTierBadge tier={getValue() as UnilizeStrategySeaTier | null} />
      ),
    },
    {
      id: "landing_page_ux",
      accessorFn: (row) => row.sea?.landing_page_ux ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.landing_page_ux}
          metricId="landing_page_ux"
        />
      ),
      cell: ({ getValue }) => (
        <SeaTierBadge tier={getValue() as UnilizeStrategySeaTier | null} />
      ),
    },
    {
      id: "impression_share",
      accessorFn: (row) => row.sea?.impression_share ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.impression_share}
          metricId="impression_share"
        />
      ),
      cell: ({ getValue }) => (
        <ShareBar value={getValue() as number | null} />
      ),
    },
    {
      id: "cpc",
      accessorFn: (row) => row.sea?.cpc ?? null,
      header: () => (
        <MetricHeader label={STRATEGY_COLUMN_LABELS.cpc} metricId="cpc" />
      ),
      cell: ({ getValue }) =>
        formatNullableCurrency(getValue() as number | null),
    },
    {
      id: "conversion_rate",
      accessorFn: (row) => row.sea?.conversion_rate ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.conversion_rate}
          metricId="conversion_rate"
        />
      ),
      cell: ({ getValue }) =>
        formatNullablePercent(getValue() as number | null),
    },
    {
      id: "authority_score",
      accessorFn: (row) => resolveStrategyAuthorityLabel(row.seo),
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.authority_score}
          metricId="seo_bas"
        />
      ),
      cell: ({ getValue }) => {
        const label = getValue() as string | null;
        if (!label) {
          return "—";
        }
        return <OptimizationBadge label={label} />;
      },
    },
    {
      id: "semantic_score",
      accessorFn: (row) => resolveStrategySemanticLabel(row.seo),
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.semantic_score}
          metricId="semantic_score"
        />
      ),
      cell: ({ getValue }) => {
        const label = getValue() as string | null;
        if (!label) {
          return "—";
        }
        return <OptimizationBadge label={label} />;
      },
    },
    {
      id: "position",
      accessorFn: (row) => row.seo?.position ?? null,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.position}
          metricId="position"
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null || !Number.isFinite(value)) {
          return "—";
        }
        return (
          <span
            className={cn(
              "tabular-nums rounded px-1.5 py-0.5",
              seoPositionTone(value),
            )}
          >
            {formatDecimal(value)}
          </span>
        );
      },
    },
    {
      id: "page_intent_match",
      accessorFn: (row) => row.seo?.page_intent_match,
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.page_intent_match}
          metricId="page_intent_match"
        />
      ),
      cell: ({ getValue }) => {
        const match = getValue() as boolean | undefined;
        const label = formatPageIntentMatch(match);
        if (label === "—") {
          return label;
        }
        return (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-xs",
              pageIntentTone(match === true),
            )}
          >
            {label}
          </span>
        );
      },
    },
  ];
}

function isNumericColumn(columnId: string): boolean {
  return (
    columnId !== "keyword" &&
    columnId !== "recommendation" &&
    columnId !== "authority_score" &&
    columnId !== "semantic_score" &&
    columnId !== "ad_relevance" &&
    columnId !== "expected_ctr" &&
    columnId !== "landing_page_ux" &&
    columnId !== "page_intent_match" &&
    columnId !== "budget_lost" &&
    columnId !== "rank_lost" &&
    columnId !== "impression_share"
  );
}

export function StrategyKeywordTable({
  rows,
  lens,
  extraColumns,
}: {
  rows: UnilizeKeywordComparison[];
  lens: AnalysisLens;
  extraColumns: ReadonlySet<string>;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const data = useMemo(() => rows, [rows]);
  const visibleIds = useMemo(
    () => getVisibleStrategyColumns(lens, extraColumns),
    [lens, extraColumns],
  );
  const allColumns = useMemo(() => buildColumns(), []);
  const columns = useMemo(
    () => allColumns.filter((col) => visibleIds.includes(col.id ?? "")),
    [allColumns, visibleIds],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-6 text-sm">
        Aucune analyse stratégique pour cette combinaison projet / campagne.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20">
            {headerGroup.headers.map((header) => {
              const columnId = header.column.id;
              const numeric = isNumericColumn(columnId);
              const channel = STRATEGY_COLUMN_CHANNEL[columnId] ?? "common";
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    numeric && "text-right whitespace-nowrap",
                    channel !== "common" && STRATEGY_CHANNEL_HEAD_CLASS[channel],
                    columnId === "keyword" && stickyFirstColumnClass("header"),
                  )}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className={
                        numeric
                          ? "inline-flex w-full cursor-pointer select-none items-center justify-end gap-1"
                          : "cursor-pointer select-none"
                      }
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
            className={cn(rowIndex % 2 === 1 && "bg-muted/15")}
          >
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              const channel = STRATEGY_COLUMN_CHANNEL[columnId] ?? "common";
              const sticky = columnId === "keyword";
              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    isNumericColumn(columnId) && "text-right whitespace-nowrap",
                    channel !== "common" && STRATEGY_CHANNEL_HEAD_CLASS[channel],
                    sticky && stickyBodyColumnClass(rowIndex),
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
