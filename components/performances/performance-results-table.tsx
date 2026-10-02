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
import { PerformanceColumnMenu } from "@/components/performances/performance-column-menu";
import { ShareBar } from "@/components/ui/share-bar";
import { UnavailableMetric } from "@/components/ui/unavailable-metric";
import { DataTableShell } from "@/components/ui/data-table-shell";
import { KeywordTableFilter } from "@/components/ui/keyword-table-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getNetlinkingCompetitorAuthoritySpread,
  getSemanticCompetitorScoreSpread,
} from "@/lib/performances/competitor-scores";
import {
  computeGlobalCtr,
  isPerformanceColumnVisible,
  orderPerformanceVisibleColumns,
  PERFORMANCE_COLUMN_LABELS,
  PERFORMANCE_COLUMN_PRESETS,
  resolvePerformanceVisibleColumns,
  type PerformanceColumnPresetId,
} from "@/lib/performances/column-presets";
import {
  stickyBodyColumnClass,
  stickyHeaderCellClass,
  stickyHeaderFirstColumnClass,
} from "@/lib/ui/table-visual";
import { volumeTone } from "@/lib/ui/metric-tone";
import {
  formatCurrencyEur,
  formatNumber,
} from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import { filterRowsByKeywordQuery, formatKeywordLabel } from "@/lib/projects/keywords";
import { useSelectionStore } from "@/stores/selection.store";
import {
  countActiveAcquisitions,
  countFailedAcquisitions,
  formatFractionPercent,
} from "@/lib/performances/format-metrics";
import type { UnilizeAcquisitions, UnilizePerformance } from "@/types/performance";
import { Badge } from "@/components/ui/badge";

/** Intitulés longs : wrap autorisé pour ne pas étirer la colonne. */
const PERFORMANCE_WRAP_HEADER_COLUMNS = new Set([
  "budget_lost_impression_share",
  "rank_lost_impression_share",
  "potential_impressions_budget",
  "potential_impressions_rank",
  "average_position",
  "real_time_position",
  "netlinking_avg",
  "semantic_avg",
  "semantic_max",
  "semantic_min",
  "collection_status",
]);

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

function CollectionStatusCell({
  acquisitions,
}: {
  acquisitions: UnilizeAcquisitions | null | undefined;
}) {
  const pending = countActiveAcquisitions(acquisitions);
  const failed = countFailedAcquisitions(acquisitions);
  if (!acquisitions) {
    return "—";
  }
  if (failed > 0) {
    return (
      <Badge variant="destructive" className="text-xs font-normal">
        {failed} échec{failed > 1 ? "s" : ""}
      </Badge>
    );
  }
  if (pending === 0) {
    return (
      <Badge variant="outline" className="text-xs font-normal">
        À jour
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {pending} en cours
    </Badge>
  );
}

function buildColumns(): ColumnDef<UnilizePerformance>[] {
  return [
    {
      id: "keyword",
      accessorKey: "keyword",
      header: () => <MetricHeader label="Mot-clé" metricId="keyword" />,
      sortingFn: "alphanumeric",
      cell: ({ row, getValue }) => (
        <span className="inline-flex items-center gap-2 font-medium">
          {formatKeywordLabel(getValue())}
          {countActiveAcquisitions(row.original.acquisitions) > 0 ? (
            <Badge variant="secondary" className="text-[10px] font-normal">
              Collecte…
            </Badge>
          ) : null}
        </span>
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
      id: "no_click_rate",
      accessorKey: "no_click_rate",
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.no_click_rate}
          metricId="no_click_rate"
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null | undefined;
        return value === null || value === undefined
          ? "—"
          : formatFractionPercent(value);
      },
    },
    {
      id: "ctr_global",
      accessorFn: (row) => computeGlobalCtr(row),
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.ctr_global}
          metricId="ctr_global"
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value === null ? "—" : formatFractionPercent(value);
      },
    },
    {
      id: "collection_status",
      accessorFn: (row) => countActiveAcquisitions(row.acquisitions),
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.collection_status}
          metricId="collection_status"
        />
      ),
      cell: ({ row }) => (
        <CollectionStatusCell acquisitions={row.original.acquisitions} />
      ),
    },
    {
      id: "impressions",
      accessorFn: (row) => row.paid_performances?.impressions ?? null,
      header: () => <MetricHeader label="Impr. SEA" metricId="impressions" />,
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "clicks",
      accessorFn: (row) => row.paid_performances?.clicks ?? null,
      header: () => <MetricHeader label="Clics SEA" metricId="clicks" />,
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "cost",
      accessorFn: (row) => row.paid_performances?.cost ?? null,
      header: () => <MetricHeader label="Dépense SEA" metricId="cost" />,
      cell: ({ getValue }) =>
        formatNullableCurrency(getValue() as number | null),
    },
    {
      id: "ctr",
      accessorFn: (row) => row.paid_performances?.ctr ?? null,
      header: () => <MetricHeader label="CTR SEA" metricId="ctr" />,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value === null ? "—" : formatFractionPercent(value);
      },
    },
    {
      id: "cpc",
      accessorFn: (row) => row.paid_performances?.cpc ?? null,
      header: () => <MetricHeader label="CPC" metricId="cpc" />,
      cell: ({ getValue }) =>
        formatNullableCurrency(getValue() as number | null),
    },
    {
      id: "conversions",
      accessorFn: (row) => row.paid_performances?.conversions ?? null,
      header: () => (
        <MetricHeader label="Conversions" metricId="conversions" />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "roas",
      accessorFn: (row) => row.paid_performances?.roas ?? null,
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
      accessorFn: (row) => row.paid_performances?.quality_score ?? null,
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
      id: "budget_lost_impression_share",
      accessorFn: (row) => row.paid_performances?.search_budget_lost_impression_share ?? null,
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
      accessorFn: (row) => row.paid_performances?.search_rank_lost_impression_share ?? null,
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
      accessorFn: (row) => row.paid_performances?.potential_impressions_with_full_budget ?? null,
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
      accessorFn: (row) => row.paid_performances?.potential_impressions_with_full_rank ?? null,
      header: () => (
        <MetricHeader
          label="Impr. potent. (rank)"
          metricId="potential_impressions_rank"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "seo_impressions",
      accessorFn: (row) => row.organic_performances?.impressions ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.seo_impressions}
          metricId="seo_impressions"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "seo_clicks",
      accessorFn: (row) => row.organic_performances?.clicks ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.seo_clicks}
          metricId="seo_clicks"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "seo_ctr",
      accessorFn: (row) => row.organic_performances?.ctr ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.seo_ctr}
          metricId="seo_ctr"
        />
      ),
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value === null ? "—" : formatFractionPercent(value);
      },
    },
    {
      id: "average_position",
      accessorFn: (row) => row.organic_performances?.average_position ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.average_position}
          metricId="average_position"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "real_time_position",
      accessorFn: (row) => row.organic_ranking?.position ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.real_time_position}
          metricId="real_time_position"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "netlinking_avg",
      accessorFn: (row) =>
        getNetlinkingCompetitorAuthoritySpread(row)?.average ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.netlinking_avg}
          metricId="netlinking_avg"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "semantic_avg",
      accessorFn: (row) =>
        getSemanticCompetitorScoreSpread(row)?.average ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.semantic_avg}
          metricId="semantic_avg"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "semantic_max",
      accessorFn: (row) => getSemanticCompetitorScoreSpread(row)?.max ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.semantic_max}
          metricId="semantic_max"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
    {
      id: "semantic_min",
      accessorFn: (row) => getSemanticCompetitorScoreSpread(row)?.min ?? null,
      header: () => (
        <MetricHeader
          label={PERFORMANCE_COLUMN_LABELS.semantic_min}
          metricId="semantic_min"
        />
      ),
      cell: ({ getValue }) => formatNullableNumber(getValue() as number | null),
    },
  ];
}

export function PerformanceResultsTable({
  rows,
}: {
  rows: UnilizePerformance[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keywordQuery, setKeywordQuery] = useState("");
  const performanceVisibleColumns = useSelectionStore(
    (s) => s.performanceVisibleColumns,
  );
  const setPerformanceVisibleColumn = useSelectionStore(
    (s) => s.setPerformanceVisibleColumn,
  );
  const setPerformanceVisibleColumns = useSelectionStore(
    (s) => s.setPerformanceVisibleColumns,
  );
  const resetPerformanceVisibleColumns = useSelectionStore(
    (s) => s.resetPerformanceVisibleColumns,
  );
  const visibleColumnSet = useMemo(
    () => resolvePerformanceVisibleColumns(performanceVisibleColumns),
    [performanceVisibleColumns],
  );

  const applyPreset = (presetId: PerformanceColumnPresetId) => {
    setPerformanceVisibleColumns(PERFORMANCE_COLUMN_PRESETS[presetId]);
  };
  const data = useMemo(
    () => filterRowsByKeywordQuery(rows, (row) => row.keyword, keywordQuery),
    [rows, keywordQuery],
  );
  const allColumns = useMemo(() => buildColumns(), []);
  const columnsById = useMemo(() => {
    const map = new Map<string, (typeof allColumns)[number]>();
    for (const column of allColumns) {
      if (column.id) map.set(column.id, column);
    }
    return map;
  }, [allColumns]);

  const columns = useMemo(() => {
    const orderedIds = [
      "keyword",
      ...orderPerformanceVisibleColumns(visibleColumnSet),
    ];
    return orderedIds
      .map((id) => columnsById.get(id))
      .filter((col): col is (typeof allColumns)[number] => Boolean(col))
      .filter((col) =>
        isPerformanceColumnVisible(col.id ?? "", visibleColumnSet),
      );
  }, [allColumns, columnsById, visibleColumnSet]);

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
        Aucune performance enregistrée pour ce projet.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <DataTableShell
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <KeywordTableFilter value={keywordQuery} onChange={setKeywordQuery} />
            <PerformanceColumnMenu
              visibleColumns={visibleColumnSet}
              onToggleColumn={setPerformanceVisibleColumn}
              onApplyPreset={applyPreset}
              onReset={resetPerformanceVisibleColumns}
            />
          </div>
        }
      >
        <p className="text-muted-foreground px-4 py-6 text-sm">
          Aucun mot-clé ne correspond au filtre.
        </p>
      </DataTableShell>
    );
  }

  return (
    <DataTableShell
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <KeywordTableFilter value={keywordQuery} onChange={setKeywordQuery} />
          <PerformanceColumnMenu
            visibleColumns={visibleColumnSet}
            onToggleColumn={setPerformanceVisibleColumn}
            onApplyPreset={applyPreset}
            onReset={resetPerformanceVisibleColumns}
          />
        </div>
      }
    >
      <Table disableContainerScroll>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
              {headerGroup.headers.map((header) => {
                const columnId = header.column.id;
                const sticky = columnId === "keyword";
                const wrapHeader = PERFORMANCE_WRAP_HEADER_COLUMNS.has(columnId);
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-foreground h-auto px-4 py-3.5 font-semibold",
                      wrapHeader
                        ? "max-w-[9.5rem] whitespace-normal"
                        : "whitespace-nowrap",
                      sticky ? "text-left" : "text-center",
                      sticky
                        ? stickyHeaderFirstColumnClass("header")
                        : stickyHeaderCellClass(),
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className={cn(
                          "w-full cursor-pointer select-none font-semibold",
                          wrapHeader ? "whitespace-normal" : "whitespace-nowrap",
                          sticky ? "text-left" : "text-center",
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
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3.5 whitespace-nowrap",
                      sticky ? "text-left" : "text-center",
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
