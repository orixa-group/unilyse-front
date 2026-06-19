"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OPPORTUNITY_QUADRANT_DESCRIPTIONS,
  OPPORTUNITY_QUADRANT_LABELS,
} from "@/lib/strategy/format-strategy";
import { formatDecimal, formatPercentValue } from "@/lib/utils/formatting";
import type {
  UnilizeOpportunityMatrix,
  UnilizeOpportunityMatrixEntry,
} from "@/types/strategy";

type QuadrantKey = keyof UnilizeOpportunityMatrix;

const QUADRANT_ORDER: QuadrantKey[] = [
  "high_impact",
  "quick_wins",
  "balanced",
  "low_priority",
];

function formatSemanticScore(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return formatPercentValue(value * 100);
}

function buildColumns(
  showSemanticScore: boolean,
  showPosition: boolean,
): ColumnDef<UnilizeOpportunityMatrixEntry>[] {
  const columns: ColumnDef<UnilizeOpportunityMatrixEntry>[] = [
    {
      accessorKey: "keyword",
      header: "Mot-clé",
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "volume",
      header: "Volume",
      cell: ({ getValue }) => formatDecimal(getValue() as number),
    },
  ];

  if (showSemanticScore) {
    columns.push({
      accessorKey: "semantic_score",
      header: "Score sém.",
      cell: ({ getValue }) =>
        formatSemanticScore(getValue() as number | undefined),
    });
  }

  if (showPosition) {
    columns.push({
      accessorKey: "position",
      header: "Position",
      cell: ({ getValue }) => {
        const value = getValue() as number | undefined;
        return value === undefined || !Number.isFinite(value)
          ? "—"
          : formatDecimal(value);
      },
    });
  }

  return columns;
}

function OpportunityQuadrantTable({
  quadrant,
  rows,
}: {
  quadrant: QuadrantKey;
  rows: UnilizeOpportunityMatrixEntry[];
}) {
  const showSemanticScore = quadrant !== "quick_wins";
  const showPosition = quadrant === "quick_wins";
  const columns = useMemo(
    () => buildColumns(showSemanticScore, showPosition),
    [showSemanticScore, showPosition],
  );
  const data = useMemo(() => rows, [rows]);

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-muted/20 space-y-2 rounded-xl border p-4">
      <div>
        <h3 className="text-sm font-semibold">
          {OPPORTUNITY_QUADRANT_LABELS[quadrant]}
        </h3>
        <p className="text-muted-foreground text-xs">
          {OPPORTUNITY_QUADRANT_DESCRIPTIONS[quadrant]}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucun mot-clé.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.id !== "keyword"
                          ? "text-right whitespace-nowrap"
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        {rows.length} mot{rows.length > 1 ? "s" : ""}-clé
      </p>
    </div>
  );
}

export function StrategyOpportunityMatrix({
  matrix,
}: {
  matrix: UnilizeOpportunityMatrix;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {QUADRANT_ORDER.map((quadrant) => (
        <OpportunityQuadrantTable
          key={quadrant}
          quadrant={quadrant}
          rows={matrix[quadrant]}
        />
      ))}
    </div>
  );
}
