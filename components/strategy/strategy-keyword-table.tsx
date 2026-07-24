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
import { STRATEGY_COLUMN_CHANNEL } from "@/lib/strategy/column-presets";
import { STRATEGY_COLUMN_LABELS } from "@/lib/strategy/format-strategy";
import {
  stickyBodyColumnClass,
  stickyFirstColumnClass,
  STRATEGY_CHANNEL_HEAD_CLASS,
} from "@/lib/ui/table-visual";
import {
  formatCurrencyEur,
  formatNumber,
  formatPercentValue,
} from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeKeywordComparison,
  UnilizeStrategySeaTier,
} from "@/types/strategy";

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
        return <StrategyRecommendationBadge recommendation={rec} />;
      },
    },
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
      id: "search_volume",
      accessorKey: "search_volume",
      header: () => (
        <MetricHeader
          label={STRATEGY_COLUMN_LABELS.search_volume}
          metricId="search_volume"
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null | undefined;
        if (value === null || value === undefined || !Number.isFinite(value)) {
          return "—";
        }
        return (
          <span className="tabular-nums font-medium">{formatNumber(value)}</span>
        );
      },
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
  ];
}

function isNumericColumn(columnId: string): boolean {
  return (
    columnId === "search_volume" ||
    columnId === "cpc" ||
    columnId === "conversion_rate"
  );
}

export function StrategyKeywordTable({
  rows,
}: {
  rows: UnilizeKeywordComparison[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const data = useMemo(() => rows, [rows]);
  const columns = useMemo(() => buildColumns(), []);

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
          <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
            {headerGroup.headers.map((header) => {
              const columnId = header.column.id;
              const numeric = isNumericColumn(columnId);
              const channel =
                STRATEGY_COLUMN_CHANNEL[
                  columnId as keyof typeof STRATEGY_COLUMN_CHANNEL
                ] ?? "common";
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    numeric && "text-right whitespace-nowrap",
                    channel !== "common" && STRATEGY_CHANNEL_HEAD_CLASS[channel],
                    columnId === "recommendation" &&
                      stickyFirstColumnClass("header"),
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
            className={cn(rowIndex % 2 === 1 && "bg-muted/40")}
          >
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              const channel =
                STRATEGY_COLUMN_CHANNEL[
                  columnId as keyof typeof STRATEGY_COLUMN_CHANNEL
                ] ?? "common";
              const sticky = columnId === "recommendation";
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
