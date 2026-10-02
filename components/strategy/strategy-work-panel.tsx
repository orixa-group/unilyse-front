import Link from "next/link";
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

function cellValue(row: StrategyWorkGapRow, columnId: string): string {
  switch (columnId) {
    case "keyword":
      return row.keyword;
    case "volume":
      return row.volume === null ? "—" : formatNumber(row.volume);
    case "current_score":
      return row.current_score === null ? "—" : formatNumber(row.current_score);
    case "target_score":
      return row.target_score === null ? "—" : formatNumber(row.target_score);
    case "gap":
      return row.gap === null ? "—" : formatNumber(row.gap);
    default:
      return "—";
  }
}

export function StrategyWorkPanel({
  title,
  seeAllHref,
  columns,
  rows = [],
  limit,
}: StrategyWorkPanelProps) {
  const visibleRows = limit ? rows.slice(0, limit) : rows;

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
            <TableRow className="bg-muted hover:bg-muted">
              {columns.map((column) => (
                <TableHead key={column.id} className="whitespace-nowrap">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
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
                <TableRow key={row.keyword}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={
                        column.id === "keyword"
                          ? "font-medium"
                          : "tabular-nums whitespace-nowrap"
                      }
                    >
                      {cellValue(row, column.id)}
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
