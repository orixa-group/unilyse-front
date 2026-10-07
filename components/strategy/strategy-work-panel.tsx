"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Surface } from "@/components/ui/surface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type { StrategyWorkGapRow } from "@/types/strategy-work";

export type StrategyWorkPanelColumn = {
  id: string;
  label: string;
};

type StrategyWorkPanelProps = {
  title: string;
  seeAllHref?: string;
  columns: readonly StrategyWorkPanelColumn[];
  rows?: readonly StrategyWorkGapRow[];
  limit?: number;
};

function sortValue(
  row: StrategyWorkGapRow,
  columnId: string,
): string | number | null {
  switch (columnId) {
    case "keyword":
      return row.keyword;
    case "volume":
      return row.volume;
    case "current_score":
      return row.current_score;
    case "target_score":
      return row.target_score;
    case "gap":
      return row.gap;
    default:
      return null;
  }
}

function cellValue(row: StrategyWorkGapRow, columnId: string): string {
  const value = sortValue(row, columnId);
  if (columnId === "keyword") return row.keyword;
  if (value == null || typeof value !== "number") return "—";
  return formatNumber(value);
}

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

export function StrategyWorkPanel({
  title,
  seeAllHref,
  columns,
  rows = [],
  limit,
}: StrategyWorkPanelProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "volume", desc: true },
  ]);
  const data = useMemo(() => [...rows], [rows]);
  const tableColumns = useMemo<ColumnDef<StrategyWorkGapRow>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        accessorFn: (row) => sortValue(row, column.id),
        header: column.label,
        sortingFn: (rowA, rowB, columnId) =>
          compareSortable(
            rowA.getValue(columnId) as string | number | null,
            rowB.getValue(columnId) as string | number | null,
          ),
        cell: ({ row }) => cellValue(row.original, column.id),
      })),
    [columns],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.keyword,
  });

  const visibleRows = limit
    ? table.getRowModel().rows.slice(0, limit)
    : table.getRowModel().rows;

  return (
    <Surface padding="md" className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="text-primary shrink-0 text-xs font-medium hover:underline"
          >
            Tout voir
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    <button
                      type="button"
                      className={cn(
                        "w-full cursor-pointer text-left font-semibold select-none",
                        header.column.id !== "keyword" && "text-right",
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
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-8 text-center text-sm"
                >
                  Aucun mot-clé à travailler pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "keyword"
                          ? "font-medium"
                          : "text-right tabular-nums whitespace-nowrap"
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Surface>
  );
}

export const STRATEGY_WORK_COLUMNS = [
  { id: "keyword", label: "Mot-clé" },
  { id: "volume", label: "Volume" },
  { id: "current_score", label: "Score page" },
  { id: "target_score", label: "Moy. concurrents" },
  { id: "gap", label: "Écart" },
] as const;

export const STRATEGY_NETLINKING_COLUMNS = STRATEGY_WORK_COLUMNS;
export const STRATEGY_CONTENT_COLUMNS = STRATEGY_WORK_COLUMNS;
