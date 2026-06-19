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
import { DataTableShell } from "@/components/ui/data-table-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompetitorCountBadge } from "@/components/monitoring/competitor-count-badge";
import {
  getVolumeHeatClass,
  stickyBodyColumnClass,
  stickyFirstColumnClass,
} from "@/lib/ui/table-visual";
import { formatNumber } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeKeywordMonitoring,
  UnilizeMonitoringStatus,
} from "@/types/monitoring";

const STATUS_KIND: Record<
  UnilizeMonitoringStatus,
  "target" | "consider" | "ignore"
> = {
  target: "target",
  consider: "consider",
  ignore: "ignore",
};

const columns: ColumnDef<UnilizeKeywordMonitoring>[] = [
  {
    accessorKey: "keyword",
    header: "Mot-clé",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="font-medium">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "search_volume",
    header: "Volume rech.",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className={cn("rounded px-1.5 py-0.5", getVolumeHeatClass(value))}>
          {formatNumber(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "competitor_count",
    header: "Concurrents actifs",
    cell: ({ getValue }) => (
      <CompetitorCountBadge count={getValue() as number} />
    ),
  },
  {
    accessorKey: "status",
    header: "Recommandation",
    cell: ({ getValue }) => (
      <StatusBadge kind={STATUS_KIND[getValue() as UnilizeMonitoringStatus]} />
    ),
  },
];

function isNumericColumn(columnId: string): boolean {
  return columnId !== "keyword" && columnId !== "status";
}

export function MonitoringResultsTable({
  rows,
}: {
  rows: UnilizeKeywordMonitoring[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const data = useMemo(() => rows, [rows]);

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
        Aucune donnée de monitoring pour cette combinaison projet / campagne.
      </p>
    );
  }

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20">
              {headerGroup.headers.map((header) => {
                const numeric = isNumericColumn(header.column.id);
                const sticky = header.column.id === "keyword";
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
          {table.getRowModel().rows.map((row, rowIndex) => {
            const isTarget = row.original.status === "target";
            return (
              <TableRow
                key={row.id}
                className={cn(
                  rowIndex % 2 === 1 && "bg-muted/15",
                  isTarget && "border-l-2 border-l-success bg-success/5",
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const sticky = cell.column.id === "keyword";
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isNumericColumn(cell.column.id) &&
                          "text-right whitespace-nowrap",
                        sticky &&
                          stickyBodyColumnClass(rowIndex, {
                            highlight: isTarget,
                          }),
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
