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
import { formatStrategyRecommendation } from "@/lib/strategy/format-strategy";
import { formatNumber } from "@/lib/utils/formatting";
import type { UnilizeWorkGap } from "@/types/strategy";

export type StrategyWorkPanelColumn = {
  id: string;
  label: string;
};

type StrategyWorkPanelProps = {
  title: string;
  /** Lien « Tout voir » — omis sur les pages détail. */
  seeAllHref?: string;
  columns: readonly StrategyWorkPanelColumn[];
  rows?: readonly UnilizeWorkGap[];
  /** Nombre max de lignes affichées (preview). */
  limit?: number;
};

function cellValue(row: UnilizeWorkGap, columnId: string): string {
  switch (columnId) {
    case "keyword":
      return row.keyword;
    case "priority":
      return formatNumber(row.priority);
    case "volume":
      return formatNumber(row.volume);
    case "target":
      return formatNumber(row.target_score);
    case "score":
      return `${formatNumber(row.current_score)} / ${formatNumber(row.target_score)}`;
    case "gap":
      return formatNumber(row.gap);
    case "objective":
      return formatStrategyRecommendation(row.objective);
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

export const STRATEGY_NETLINKING_COLUMNS = [
  { id: "keyword", label: "Mot-clé" },
  { id: "priority", label: "Priorité" },
  { id: "target", label: "Cible netlinking" },
  { id: "score", label: "Score / Cible" },
  { id: "objective", label: "Objectif" },
] as const;

export const STRATEGY_CONTENT_COLUMNS = [
  { id: "keyword", label: "Mot-clé" },
  { id: "priority", label: "Priorité" },
  { id: "target", label: "Cible sémantique" },
  { id: "score", label: "Score / Cible" },
  { id: "objective", label: "Objectif" },
] as const;
