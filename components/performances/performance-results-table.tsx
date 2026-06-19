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
import { ShareBar } from "@/components/ui/share-bar";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  isPerformanceColumnVisible,
} from "@/lib/performances/column-presets";
import {
  stickyBodyColumnClass,
  stickyFirstColumnClass,
} from "@/lib/ui/table-visual";
import { volumeTone } from "@/lib/ui/metric-tone";
import {
  formatCurrencyEur,
  formatNumber,
} from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type { UnilizePerformance } from "@/types/performance";

function formatApiPercent(value: number): string {
  return `${formatNumber(value, "fr-FR")} %`;
}

function formatNullableNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatNumber(value);
}

function formatNullableCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatCurrencyEur(value);
}

function buildColumns(): ColumnDef<UnilizePerformance>[] {
  return [
    {
      id: "keyword",
      accessorKey: "keyword",
      header: () => <MetricHeader label="Mot-clé" metricId="keyword" />,
      sortingFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    },
    {
      id: "search_volume",
      accessorFn: (row) => row.search_volume?.volume ?? null,
      header: () => (
        <MetricHeader label="Volume rech." metricId="search_volume" />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return (
          <span className={cn("rounded px-1.5 py-0.5", volumeTone(value))}>
            {formatNullableNumber(value)}
          </span>
        );
      },
    },
    {
      id: "impressions",
      accessorFn: (row) => row.sea?.impressions ?? null,
      header: () => <MetricHeader label="Impr. SEA" metricId="impressions" />,
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "clicks",
      accessorFn: (row) => row.sea?.clicks ?? null,
      header: () => <MetricHeader label="Clics SEA" metricId="clicks" />,
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "spend",
      accessorFn: (row) => row.sea?.spend ?? null,
      header: () => <MetricHeader label="Dépense SEA" metricId="spend" />,
      cell: ({ getValue }) =>
        formatNullableCurrency(getValue() as number | null),
    },
    {
      id: "ctr",
      accessorFn: (row) => row.sea?.ctr ?? null,
      header: () => <MetricHeader label="CTR SEA" metricId="ctr" />,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value === null ? "—" : formatApiPercent(value);
      },
    },
    {
      id: "cpc",
      accessorFn: (row) => row.sea?.cpc ?? null,
      header: () => <MetricHeader label="CPC" metricId="cpc" />,
      cell: ({ getValue }) =>
        formatNullableCurrency(getValue() as number | null),
    },
    {
      id: "conversions",
      accessorFn: (row) => row.sea?.conversions ?? null,
      header: () => (
        <MetricHeader label="Conversions" metricId="conversions" />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "roas",
      accessorFn: (row) => row.sea?.roas ?? null,
      header: () => <MetricHeader label="ROAS" metricId="roas" />,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null) {
          return "—";
        }
        return (
          <span
            className={cn(
              "tabular-nums",
              value >= 3 && "text-success font-medium",
              value > 0 && value < 1 && "text-destructive",
            )}
          >
            {formatNullableNumber(value)}
          </span>
        );
      },
    },
    {
      id: "quality_score",
      accessorFn: (row) => row.sea?.quality_score ?? null,
      header: () => (
        <MetricHeader label="Quality score" metricId="quality_score" />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        if (value === null) {
          return "—";
        }
        return (
          <span
            className={cn(
              "tabular-nums rounded px-1.5 py-0.5",
              value <= 5 && "bg-destructive/20 text-destructive dark:text-destructive font-medium",
              value >= 8 && "bg-success/20 text-success dark:text-success font-medium",
            )}
          >
            {formatNumber(value)}
          </span>
        );
      },
    },
    {
      id: "match_type",
      accessorFn: (row) => row.sea?.match_type ?? null,
      header: () => <MetricHeader label="Match" metricId="match_type" />,
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ?? "—";
      },
    },
    {
      id: "budget_lost_impression_share",
      accessorFn: (row) => row.sea?.search_budget_lost_impression_share ?? null,
      header: () => (
        <MetricHeader
          label="Impr. perdues (budget)"
          metricId="budget_lost_impression_share"
        />
      ),
      cell: ({ getValue }) => (
        <ShareBar value={getValue() as number | null} />
      ),
    },
    {
      id: "rank_lost_impression_share",
      accessorFn: (row) => row.sea?.search_rank_lost_impression_share ?? null,
      header: () => (
        <MetricHeader
          label="Impr. perdues (rank)"
          metricId="rank_lost_impression_share"
        />
      ),
      cell: ({ getValue }) => (
        <ShareBar value={getValue() as number | null} />
      ),
    },
    {
      id: "potential_impressions_budget",
      accessorFn: (row) => row.sea?.potential_impressions_with_full_budget ?? null,
      header: () => (
        <MetricHeader
          label="Impr. potent. (budget)"
          metricId="potential_impressions_budget"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "potential_impressions_rank",
      accessorFn: (row) => row.sea?.potential_impressions_with_full_rank ?? null,
      header: () => (
        <MetricHeader
          label="Impr. potent. (rank)"
          metricId="potential_impressions_rank"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
  ];
}

function isNumericColumn(columnId: string): boolean {
  return columnId !== "keyword" && columnId !== "match_type";
}

export function PerformanceResultsTable({
  rows,
}: {
  rows: UnilizePerformance[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const data = useMemo(() => rows, [rows]);
  const allColumns = useMemo(() => buildColumns(), []);

  const columns = useMemo(
    () =>
      allColumns.filter((col) =>
        isPerformanceColumnVisible(col.id ?? "", showAllColumns),
      ),
    [allColumns, showAllColumns],
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
      <p className="text-muted-foreground text-sm">
        Aucune performance enregistrée pour cette combinaison projet / campagne.
      </p>
    );
  }

  return (
    <DataTableShell
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAllColumns((v) => !v)}
        >
          {showAllColumns ? "Colonnes essentielles" : "Toutes les colonnes"}
        </Button>
      }
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20">
              {headerGroup.headers.map((header) => {
                const columnId = header.column.id;
                const numeric = isNumericColumn(columnId);
                const sticky = columnId === "keyword";
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      numeric && "text-right whitespace-nowrap",
                      sticky && stickyFirstColumnClass("header"),
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
                const sticky = columnId === "keyword";
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      isNumericColumn(columnId) && "text-right whitespace-nowrap",
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
    </DataTableShell>
  );
}
