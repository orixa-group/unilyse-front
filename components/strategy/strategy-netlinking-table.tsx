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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDecimal } from "@/lib/utils/formatting";
import type { UnilizeNetlinkingGap } from "@/types/strategy";

const columns: ColumnDef<UnilizeNetlinkingGap>[] = [
  {
    accessorKey: "keyword",
    header: "Mot-clé",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="font-medium">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "volume",
    header: "Volume rech.",
    cell: ({ getValue }) => formatDecimal(getValue() as number),
  },
  {
    accessorKey: "backlink_gap",
    header: "Écart backlinks",
    cell: ({ getValue }) => formatDecimal(getValue() as number),
  },
];

export function StrategyNetlinkingTable({
  rows,
}: {
  rows: UnilizeNetlinkingGap[];
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
      <p className="text-muted-foreground px-4 py-6 text-sm">
        Aucun écart de netlinking identifié.
      </p>
    );
  }

  return (
    <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const numeric = header.column.id !== "keyword";
                return (
                  <TableHead
                    key={header.id}
                    className={numeric ? "text-right whitespace-nowrap" : undefined}
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id !== "keyword"
                      ? "text-right whitespace-nowrap"
                      : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
  );
}
