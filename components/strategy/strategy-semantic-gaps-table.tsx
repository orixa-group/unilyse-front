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
import { OptimizationBadge } from "@/components/strategy/optimization-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveStrategySemanticLabel } from "@/lib/strategy/resolve-bas-label";
import {
  stickyBodyColumnClass,
  stickyFirstColumnClass,
} from "@/lib/ui/table-visual";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeKeywordComparison,
  UnilizeSemanticGap,
} from "@/types/strategy";

type SemanticGapRow = UnilizeSemanticGap & {
  semanticLabel: string | null;
};

function buildRows(
  gaps: UnilizeSemanticGap[],
  comparisons: UnilizeKeywordComparison[],
): SemanticGapRow[] {
  const comparisonByKeyword = new Map(
    comparisons.map((row) => [row.keyword, row]),
  );
  return gaps.map((gap) => ({
    ...gap,
    semanticLabel: resolveStrategySemanticLabel(
      comparisonByKeyword.get(gap.keyword)?.seo,
    ),
  }));
}

const columns: ColumnDef<SemanticGapRow>[] = [
  {
    accessorKey: "keyword",
    header: "Mot-clé",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => (
      <span className="font-medium">{String(getValue())}</span>
    ),
  },
  {
    id: "semantic_status",
    accessorFn: (row) => row.semanticLabel,
    header: "Couverture sémantique",
    cell: ({ getValue }) => {
      const label = getValue() as string | null;
      if (!label) {
        return <span className="text-muted-foreground">—</span>;
      }
      return <OptimizationBadge label={label} />;
    },
  },
];

export function StrategySemanticGapsTable({
  rows,
  keywordComparisons = [],
}: {
  rows: UnilizeSemanticGap[];
  keywordComparisons?: UnilizeKeywordComparison[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const data = useMemo(
    () => buildRows(rows, keywordComparisons),
    [rows, keywordComparisons],
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
        Aucun écart sémantique identifié.
      </p>
    );
  }

  return (
    <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/20 hover:bg-muted/20">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.id === "keyword" &&
                      stickyFirstColumnClass("header"),
                  )}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="cursor-pointer select-none"
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
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <TableRow
              key={row.id}
              className={cn(rowIndex % 2 === 1 && "bg-muted/15")}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.id === "keyword" &&
                      stickyBodyColumnClass(rowIndex),
                  )}
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
